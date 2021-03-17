import {Application} from "express";
import {setupTrainRoutes} from "./train-results";
import responseMiddleware from "../../modules/http/response/middleware/responseMiddleware";
import {checkAuthenticated} from "../../modules/http/request/middleware/authMiddleware";

export function registerRoutes(router: Application) {
    router.use(responseMiddleware);
    router.use(checkAuthenticated);

    router.use('/train-results', setupTrainRoutes());
}
