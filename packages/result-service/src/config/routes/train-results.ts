import {Router} from "express";
import {getTrainResultRouteHandler} from "../../app/controllers/train/result/TrainResultController";

export function setupTrainResultRoutes() {
    const router = Router();

    router.get('/:id/download', [], getTrainResultRouteHandler);

    return router;
}
