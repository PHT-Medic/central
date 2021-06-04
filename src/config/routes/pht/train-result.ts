import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {doTrainResultTaskRouteHandler} from "../../../app/controllers/pht/train/result/TrainResultController";

export function setupPhtTrainResultRoutes() {
    const router = Router();

    router.post('/:id/task', [forceLoggedIn], doTrainResultTaskRouteHandler);

    return router;
}
