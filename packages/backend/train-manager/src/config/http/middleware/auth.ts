/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function forceLoggedIn(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    if (
        typeof req.userId === 'undefined' &&
        typeof req.robotId === 'undefined'
    ) {
        throw new UnauthorizedError();
    }

    next();
}
