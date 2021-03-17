import {Router} from "express";
import {getTrainResultRouteHandler} from "../../app/controllers/train/result/TrainResultController";

export function setupTrainRoutes() {
    const router = Router();

    router.get('/:id/download', [], getTrainResultRouteHandler);

    return router;
}
