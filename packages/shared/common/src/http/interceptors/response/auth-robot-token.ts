/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useClient } from '@trapi/client';
import { ErrorCode, OAuth2TokenGrant, TokenAPI } from '@authelion/common';
import { VaultAPI } from '../../vault-client';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID } from '../../../domains';

let lastChecked : number | undefined;

function canVerifyCredentials() {
    return !lastChecked || (Date.now() - (30 * 1000)) > lastChecked;
}

export function refreshAuthRobotTokenOnResponseError(err?: any) {
    const { config } = err;

    if (
        err.response && (
            err.response.status === 401 || // Unauthorized
            err.response.status === 403 || // Forbidden
            err.response.data?.code === ErrorCode.CREDENTIALS_INVALID ||
            err.response.data?.code === ErrorCode.TOKEN_EXPIRED
        )
    ) {
        if (canVerifyCredentials()) {
            lastChecked = Date.now();

            return useClient<VaultAPI>('vault').keyValue
                .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM)
                .then((response) => {
                    const tokenApi = new TokenAPI(useClient().driver);

                    return tokenApi.create({
                        id: response.data.id,
                        secret: response.data.secret,
                        grant_type: OAuth2TokenGrant.ROBOT_CREDENTIALS,
                    })
                        .then((token) => {
                            useClient()
                                .setAuthorizationHeader({
                                    type: 'Bearer',
                                    token: token.access_token,
                                });

                            return useClient().request(config);
                        })
                        .catch((e) => {
                            useClient().unsetAuthorizationHeader();

                            return Promise.reject(e);
                        });
                })
                .catch((e) => {
                    useClient().unsetAuthorizationHeader();

                    return Promise.reject(e);
                });
        }
    }

    return Promise.reject(err);
}
