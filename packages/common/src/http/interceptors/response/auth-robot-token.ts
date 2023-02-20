/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot } from '@authup/common';
import {
    ErrorCode,
} from '@authup/common';
import { Client } from '@hapic/oauth2';
import { isClientError, stringifyAuthorizationHeader } from 'hapic';
import type { HTTPClient } from '../../client';
import { hasOwnProperty } from '../../../utils';

export function shouldRefreshRobotTokenResponseError(err: unknown) : boolean {
    return isClientError(err) && err.response && (
        err.response.status === 401 || // Unauthorized
        err.response.status === 403 || // Forbidden
        (
            hasOwnProperty(err.response.data, 'code') &&
            (
                err.response.data?.code === ErrorCode.CREDENTIALS_INVALID ||
                err.response.data?.code === ErrorCode.TOKEN_EXPIRED ||
                err.response.data?.code === ErrorCode.TOKEN_INVALID
            )
        )
    );
}

function getCurrentState(config) : { retryCount: number } {
    const currentState = config.retry || {};
    currentState.retryCount = currentState.retryCount || 0;
    config.retry = currentState;
    return currentState;
}

export function createRefreshRobotTokenOnResponseErrorHandler(context: {
    httpClient: HTTPClient,
    load: () => Promise<Pick<Robot, 'id' | 'secret'>>
}) {
    return (err?: any) => {
        if (!isClientError(err)) {
            return Promise.reject(err);
        }

        const { config } = err;

        const currentState = getCurrentState(config);
        if (currentState.retryCount > 0) {
            return Promise.reject(err);
        }

        if (shouldRefreshRobotTokenResponseError(err)) {
            currentState.retryCount += 1;

            context.httpClient.unsetAuthorizationHeader();

            return context.httpClient.root.checkIntegrity()
                .then(() => context.load())
                .then((response) => {
                    const tokenApi = new Client();
                    tokenApi.setDriver(context.httpClient.driver);

                    return tokenApi.token.createWithRobotCredentials({
                        id: response.id,
                        secret: response.secret,
                    })
                        .then((token) => {
                            context.httpClient
                                .setAuthorizationHeader({
                                    type: 'Bearer',
                                    token: token.access_token,
                                });

                            config.headers = JSON.parse(JSON.stringify(config.headers || {}));
                            (config.headers as Record<string, any>).Authorization = stringifyAuthorizationHeader({
                                type: 'Bearer',
                                token: token.access_token,
                            });

                            return context.httpClient.request(config);
                        })
                        .catch((e) => {
                            context.httpClient.unsetAuthorizationHeader();

                            if (isClientError(e)) {
                                e.response.status = 500;
                            }

                            return Promise.reject(e);
                        });
                })
                .catch((e) => {
                    context.httpClient.unsetAuthorizationHeader();

                    return Promise.reject(e);
                });
        }

        return Promise.reject(err);
    };
}
