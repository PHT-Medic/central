/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import type { HandlerInterface } from '@routup/decorators';
import type {
    Next, Request, Response,
} from 'routup';
import { useRequestEnv } from '../request';

export class ForceLoggedInMiddleware implements HandlerInterface {
    public run(request: Request, response: Response, next: Next) {
        if (
            typeof useRequestEnv(request, 'userId') === 'undefined' &&
            typeof useRequestEnv(request, 'robotId') === 'undefined'
        ) {
            throw new UnauthorizedError();
        }

        next();
    }
}
