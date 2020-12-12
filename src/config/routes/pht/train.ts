import {Router} from "express";
import {forceLoggedIn} from "../../../services/http/request/middleware/authMiddleware";

import {
    addTrainRouteHandler, doTrainActionRouteHandler,
    dropTrainRouteHandler,
    editTrainRouteHandler,
    getTrainRouteHandler,
    getTrainsRouteHandler
} from "../../../controllers/pht/train/TrainController";
import {
    dropTrainFileRouteHandler, getTrainFileRouteHandler, getTrainFilesRouteHandler,
    uploadTrainFilesRouteHandler
} from "../../../controllers/pht/train/file/TrainFileController";
import {getTrainResultRouteHandler} from "../../../controllers/pht/train/result/TrainResultController";

export function setupPhtTrainRoutes() {
    const router = Router();

    router.get('/:id/download', [], getTrainResultRouteHandler);

    router.delete('/:id/files/:fileId', [forceLoggedIn], dropTrainFileRouteHandler);
    router.get('/:id/files/:fileId', [forceLoggedIn], getTrainFileRouteHandler);
    router.post('/:id/files', [forceLoggedIn], uploadTrainFilesRouteHandler);
    router.get('/:id/files', [forceLoggedIn], getTrainFilesRouteHandler);

    /**
     * Train Routes
     **/
    // Station Routes
    router.get('/:id/action/:action', [forceLoggedIn], doTrainActionRouteHandler);
    router.get('/:id', [forceLoggedIn], getTrainRouteHandler);
    router.post('/:id', [forceLoggedIn], editTrainRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropTrainRouteHandler);

    router.post('/', [forceLoggedIn], addTrainRouteHandler);
    router.get('/', [forceLoggedIn], getTrainsRouteHandler);
    return router;
}
