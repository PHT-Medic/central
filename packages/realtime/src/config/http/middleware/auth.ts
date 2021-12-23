/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@typescript-error/http';
import { AuthorizationHeader } from '@typescript-auth/core';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function forceLoggedIn(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    if (
        typeof req.userId === 'undefined' &&
        typeof req.serviceId === 'undefined'
    ) {
        throw new UnauthorizedError('You are not authenticated.');
    }

    next();
}

export async function authenticateWithAuthorizationHeader(socket: any, value: AuthorizationHeader): Promise<void> {
    // eslint-disable-next-line default-case
    switch (value.type) {
        case 'Bearer': {
            break;
        }
    }
}

export function parseCookie(request: any): string | undefined {
    try {
        if (typeof request.cookies?.auth_token !== 'undefined') {
            const { access_token: accessToken } = JSON.parse(request.cookies?.auth_token);

            return accessToken;
        }
    } catch (e) {
        // don't handle error, this is just fine :)
    }

    return undefined;
}
