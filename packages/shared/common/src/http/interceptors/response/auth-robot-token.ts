/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ErrorCode, Robot,
} from '@authelion/common';
import { Client } from '@hapic/oauth2';
import { isClientError } from 'hapic';
import { HTTPClient } from '../../client';
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

export function createRefreshRobotTokenOnResponseErrorHandler(context: {
    httpClient?: HTTPClient,
    load: () => Promise<Pick<Robot, 'id' | 'secret'>>
}) {
    return (err?: any) => {
        const { config } = err;

        if (shouldRefreshRobotTokenResponseError(err)) {
            return context.load()
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

                            return context.httpClient.request(config);
                        })
                        .catch((e) => {
                            context.httpClient.unsetAuthorizationHeader();

                            e.response.status = 500;
                            e.response.data = {
                                ...(e.response.data || {}),
                                code: null,
                            };

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
