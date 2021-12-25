/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionItem } from '@typescript-auth/core';
import { User } from '../user';

export type TokenPayload = {
    /**
     * owner id
     */
    sub: number | string,

    /**
     * issuer (api address)
     */
    iss: string,
    /**
     * remote address
     */
    remoteAddress: string,

    /**
     * Issued at (readonly)
     */
    iat?: number,

    /**
     * Expire at (readonly)
     */
    exp?: number
};

export type TokenVerificationPayload = {
    token: TokenPayload,
    target: {
        type: 'user',
        data: User & {
            permissions: PermissionItem<any>[]
        }
    }
};

export type TokenGrantPayload = {
    username: string,
    password: string
};
