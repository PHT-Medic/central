/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Router } from 'routup';
import { registerMiddlewares } from './middlewares';
import { registerControllers } from './routes';
import { registerErrorHandler } from './middleware';

export function createRouter() : Router {
    const router = new Router();

    registerMiddlewares(router);
    registerControllers(router);
    registerErrorHandler(router);

    return router;
}
