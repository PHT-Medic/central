import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    getMasterImageRouteHandler,
    getMasterImagesRouteHandler
} from "../../../app/controllers/pht/master-image/MasterImageController";

export function setupPhtMasterImageRoutes() {
    const router = Router();

    /**
     * Station Routes
     **/
    // Master Image Routes
    router.get('/:id', [forceLoggedIn], getMasterImageRouteHandler);
    router.get('/', [forceLoggedIn], getMasterImagesRouteHandler);
    return router;
}
