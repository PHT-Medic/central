import {Router} from "express";
import {setupPhtStationRoutes} from "./station";
import {setupPhtMasterImageRoutes} from "./master-image";
import {setupPhtProposalRoutes} from "./proposal";
import {setupPhtTrainRoutes} from "./train";
import {setupPhtTrainResultRoutes} from "./train-result";

export default function setupPhtRoutes() {
    let router = Router();

    router.use('/proposals', setupPhtProposalRoutes());
    router.use('/stations', setupPhtStationRoutes());
    router.use('/master-images', setupPhtMasterImageRoutes());
    router.use('/trains', setupPhtTrainRoutes());
    router.use('/train-results', setupPhtTrainResultRoutes());

    return router;
}
