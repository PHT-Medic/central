import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    addTrainStationRouteHandler,
    dropTrainStationRouteHandler,
    editTrainStationRouteHandler,
    getTrainStationRouteHandler,
    getTrainStationsRouteHandler
} from "../../../app/controllers/pht/train/station/TrainStationController";

export function setupPhtTrainStationRoutes() {
    const router = Router();

    router.get('/:id', [forceLoggedIn], (req: any, res: any) => {
        return getTrainStationRouteHandler(req,res);
    });
    router.post('/:id', [forceLoggedIn], (req: any, res: any) => {
        return editTrainStationRouteHandler(req, res);
    });
    router.delete('/:id', [forceLoggedIn], (req: any, res: any) => {
        return dropTrainStationRouteHandler(req, res);
    });

    router.get('/', [forceLoggedIn], (req: any, res: any) => {
        return getTrainStationsRouteHandler(req,res);
    })
    router.post('/', [
        forceLoggedIn
    ],addTrainStationRouteHandler);



    return router;
}
