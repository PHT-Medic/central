import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    addStationRouteHandler, dropStationRouteHandler, editStationRouteHandler,
    getStationRouteHandler,
    getStationsRouteHandler
} from "../../../app/controllers/pht/station/StationController";
import {doStationTaskRouteHandler} from "../../../app/controllers/pht/station/StationActionController";

export function setupPhtStationRoutes() {
    const router = Router();

    router.post('/:id/task', [forceLoggedIn], doStationTaskRouteHandler);

    /**
     * Station Routes
     **/
    // Station Routes
    router.get('/:id', [forceLoggedIn], getStationRouteHandler);
    router.post('/:id', [forceLoggedIn], editStationRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropStationRouteHandler);

    router.post('/', [forceLoggedIn], addStationRouteHandler);
    router.get('/', [forceLoggedIn], getStationsRouteHandler);
    return router;
}
