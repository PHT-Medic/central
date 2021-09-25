import {Application} from "express";
import {setupTrainResultRoutes} from "./train-results";
import responseMiddleware from "../middleware/response";

export function registerRoutes(router: Application) {
    router.use(responseMiddleware);

    router.use('/train-results', setupTrainResultRoutes());
}
