import {Application} from "express";
import {setupTrainResultRoutes} from "./train-results";
import responseMiddleware from "../http/response/middleware/responseMiddleware";

export function registerRoutes(router: Application) {
    router.use(responseMiddleware);

    router.use('/train-results', setupTrainResultRoutes());
}
