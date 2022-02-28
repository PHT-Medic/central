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
