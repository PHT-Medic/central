/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Middleware } from '@decorators/express';
import { UnauthorizedError } from '@typescript-error/http';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function forceLoggedIn(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    if (
        typeof req.userId === 'undefined'
        && typeof req.serviceId === 'undefined'
    ) {
        throw new UnauthorizedError('You are not authenticated.');
    }

    next();
}

export class ForceLoggedInMiddleware implements Middleware {
    public use(request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction) {
        return forceLoggedIn(request, response, next);
    }
}
