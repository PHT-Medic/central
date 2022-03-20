/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Router } from 'express';
import { streamTrainResultRouteHandler } from '../controllers/train-result';
import { forceLoggedIn } from '../middleware/auth';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function setupTrainResultRoutes() {
    const router = Router();

    router.get(
        '/:id/download',
        [forceLoggedIn],
        async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
            try {
                await streamTrainResultRouteHandler(req, res);
            } catch (e) {
                next(e);
            }
        },
    );

    return router;
}
