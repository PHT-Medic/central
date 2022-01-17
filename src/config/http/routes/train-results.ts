import { Router } from 'express';
import { getTrainResultRouteHandler } from '../../../app/controllers/train-result';
import { forceLoggedIn } from '../middleware/auth';

export function setupTrainResultRoutes() {
    const router = Router();

    router.get('/:id/download', [forceLoggedIn], getTrainResultRouteHandler);

    return router;
}
