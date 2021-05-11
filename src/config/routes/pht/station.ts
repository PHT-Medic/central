import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    addStationRouteHandler, dropStationRouteHandler, editStationRouteHandler,
    getStationRouteHandler,
    getStationsRouteHandler
} from "../../../app/controllers/pht/station/StationController";
import {
    editStationProposalRouteHandler,
    getStationProposalRouteHandler,
    getStationProposalsRouteHandler
} from "../../../app/controllers/pht/station/proposal/StationProposalRelationController";
import {doStationTaskRouteHandler} from "../../../app/controllers/pht/station/StationActionController";

export function setupPhtStationRoutes() {
    const router = Router();

    /**
     * Station Proposal Routes
     */
    router.post('/:id/relationships/proposals/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return editStationProposalRouteHandler(req,res);
    });

    router.get('/:id/relationships/proposals/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return getStationProposalRouteHandler(req,res,'self');
    });
    router.get('/:id/relationships/proposals', [forceLoggedIn], (req: any, res: any) => {
        return getStationProposalsRouteHandler(req,res,'self');
    });

    // Relationship Related
    router.get('/:id/proposals/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return getStationProposalRouteHandler(req,res,'related');
    });
    router.get('/:id/proposals', [forceLoggedIn], (req: any, res: any) => {
        return getStationProposalsRouteHandler(req,res,'related');
    });

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
