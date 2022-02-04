/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useClient } from '@trapi/client';
import { ErrorCode, OAuth2TokenGrant, TokenAPI } from '@typescript-auth/domains';
import { VaultAPI } from '../../vault-client';
import { ROBOT_SECRET_ENGINE_KEY, ServiceID } from '../../../domains';

export async function refreshAuthRobotTokenOnResponseError(err?: any) {
    const { config } = err;

    if (
        err.response && (
            err.response.status === 401 || // Unauthorized
            err.response.status === 403 || // Forbidden
            err.response.data?.code === ErrorCode.CREDENTIALS_INVALID ||
            err.response.data?.code === ErrorCode.TOKEN_EXPIRED
        )
    ) {
        const response = await useClient<VaultAPI>('vault').keyValue
            .find(ROBOT_SECRET_ENGINE_KEY, ServiceID.SYSTEM);

        if (response) {
            const tokenApi = new TokenAPI(useClient().driver);

            const token = await tokenApi.create({
                id: response.data.id,
                secret: response.data.secret,
                grant_type: OAuth2TokenGrant.ROBOT_CREDENTIALS,
            });

            useClient().setAuthorizationHeader({
                type: 'Bearer',
                token: token.access_token,
            });

            return useClient().request(config);
        }

        useClient().unsetAuthorizationHeader();
    }

    return Promise.reject(err);
}
