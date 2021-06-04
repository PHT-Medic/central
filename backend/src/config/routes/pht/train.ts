import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";

import {
    addTrainRouteHandler, dropTrainRouteHandler,
    editTrainRouteHandler,
    getTrainRouteHandler,
    getTrainsRouteHandler
} from "../../../app/controllers/pht/train/TrainController";
import {
    dropTrainFileRouteHandler, getTrainFileRouteHandler, getTrainFilesRouteHandler
} from "../../../app/controllers/pht/train/file/TrainFileController";
import {uploadTrainFilesRouteHandler} from "../../../app/controllers/pht/train/file/TrainFileUploadController";
import {getTrainFileStreamRouteHandler} from "../../../app/controllers/pht/train/file/TrainFileStreamController";
import {
    doTrainTaskRouteHandler
} from "../../../app/controllers/pht/train/TrainActionController";

export function setupPhtTrainRoutes() {
    const router = Router();

    /**
     * Train File Routes
     **/
    router.delete('/:id/files/:fileId', [forceLoggedIn], dropTrainFileRouteHandler);
    router.get('/:id/files/:fileId', [forceLoggedIn], getTrainFileRouteHandler);
    router.post('/:id/files', [forceLoggedIn], uploadTrainFilesRouteHandler);
    router.get('/:id/files', [forceLoggedIn], getTrainFilesRouteHandler);
    router.get('/:id/tar', [forceLoggedIn], getTrainFileStreamRouteHandler);

    /**
     * Train Routes
     **/
    // Station Routes
    router.post('/:id/task', [forceLoggedIn], doTrainTaskRouteHandler);
    router.get('/:id', [forceLoggedIn], getTrainRouteHandler);
    router.post('/:id', [forceLoggedIn], editTrainRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropTrainRouteHandler);

    router.post('/', [forceLoggedIn], addTrainRouteHandler);
    router.get('/', [forceLoggedIn], getTrainsRouteHandler);
    return router;
}
