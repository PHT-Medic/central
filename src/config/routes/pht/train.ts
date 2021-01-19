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
import {getTrainResultRouteHandler} from "../../../app/controllers/pht/train/result/TrainResultController";
import {uploadTrainFilesRouteHandler} from "../../../app/controllers/pht/train/file/TrainFileUploadController";
import {getTrainFileStreamRouteHandler} from "../../../app/controllers/pht/train/file/TrainFileStreamController";
import {
    doTrainBuilderTaskRouteHandler, doTrainTaskRouteHandler,
    generateTrainHashActionRouteHandler
} from "../../../app/controllers/pht/train/TrainActionController";

export function setupPhtTrainRoutes() {
    const router = Router();

    router.get('/:id/download', [], getTrainResultRouteHandler);

    router.delete('/:id/files/:fileId', [forceLoggedIn], dropTrainFileRouteHandler);
    router.get('/:id/files/:fileId', [forceLoggedIn], getTrainFileRouteHandler);
    router.post('/:id/files', [forceLoggedIn], uploadTrainFilesRouteHandler);
    router.get('/:id/files', [forceLoggedIn], getTrainFilesRouteHandler);
    router.get('/:id/tar', [forceLoggedIn], getTrainFileStreamRouteHandler);

    /**
     * Train Routes
     **/
    // Station Routes
    router.post('/:id/hash-generate', [forceLoggedIn], generateTrainHashActionRouteHandler);
    router.post('/:id/train-task', [forceLoggedIn], doTrainTaskRouteHandler);
    router.post('/:id/train-builder-task', [forceLoggedIn], doTrainBuilderTaskRouteHandler);
    router.get('/:id', [forceLoggedIn], getTrainRouteHandler);
    router.post('/:id', [forceLoggedIn], editTrainRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropTrainRouteHandler);

    router.post('/', [forceLoggedIn], addTrainRouteHandler);
    router.get('/', [forceLoggedIn], getTrainsRouteHandler);
    return router;
}
