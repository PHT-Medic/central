/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode, HTTPClient, isObject } from '@authup/common';
import type { Client as VaultClient } from '@hapic/vault';
import { isClientError } from 'hapic';
import type { Client } from 'hapic';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID } from '@personalhealthtrain/central-common';

export function isValidError(err: unknown) : boolean {
    if (!isClientError(err) || !err.response) {
        return false;
    }

    if (err.response.status === 401 || err.response.status === 403) {
        return true;
    }

    if (!isObject(err.response.data) || typeof err.response.data.code !== 'string') {
        return false;
    }

    return err.response.data.code === ErrorCode.CREDENTIALS_INVALID ||
        err.response.data.code === ErrorCode.TOKEN_EXPIRED ||
        err.response.data.code === ErrorCode.TOKEN_INVALID;
}

function getCurrentState(config) : { retryCount: number } {
    const currentState = config.retry || {};
    currentState.retryCount = currentState.retryCount || 0;
    config.retry = currentState;
    return currentState;
}

export function mountHTTPInterceptorForRefreshingToken(
    client: Client,
    context: {
        vault: VaultClient,
        authApiUrl: string
    },
) : number {
    const authupClient = new HTTPClient({
        driver: {
            baseURL: context.authApiUrl,
        },
    });

    return client.mountResponseInterceptor(
        (value) => value,
        (err?: any) => {
            if (!isClientError(err)) {
                return Promise.reject(err);
            }

            const { config } = err;

            const currentState = getCurrentState(config);
            if (currentState.retryCount > 0) {
                return Promise.reject(err);
            }

            if (isValidError(err)) {
                currentState.retryCount += 1;

                client.unsetAuthorizationHeader();

                return authupClient.robot.integrity(ServiceID.SYSTEM)
                    .then(() => context.vault.keyValue.find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM))
                    .then((response) => authupClient.oauth2.token.createWithRobotCredentials({
                        id: response.data.id,
                        secret: response.data.secret,
                    })
                        .then((token) => {
                            client
                                .setAuthorizationHeader({
                                    type: 'Bearer',
                                    token: token.access_token,
                                });

                            config.headers = JSON.parse(JSON.stringify(config.headers || {}));
                            (config.headers as Record<string, any>).Authorization = `Bearer ${token.access_token}`;

                            return client.request(config);
                        })
                        .catch((e) => {
                            client.unsetAuthorizationHeader();

                            if (isClientError(e)) {
                                e.response.status = 500;
                            }

                            return Promise.reject(e);
                        }))
                    .catch((e) => {
                        client.unsetAuthorizationHeader();

                        return Promise.reject(e);
                    });
            }

            return Promise.reject(err);
        },
    );
}
