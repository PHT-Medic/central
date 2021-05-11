import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    addProposalRouteHandler,
    dropProposalRouteHandler,
    editProposalRouteHandler,
    getProposalRouteHandler, getProposalsRouteHandler
} from "../../../app/controllers/pht/proposal/ProposalController";
import {
    addProposalStationRouteHandler,
    dropProposalStationRouteHandler, getProposalStationRouteHandler, getProposalStationsRouteHandler
} from "../../../app/controllers/pht/proposal/station/ProposalStationRelationController";

export function setupPhtProposalRoutes() {
    const router = Router();

    /**
     * Proposal Station Routes
     */

    router.post('/:id/relationships/stations', [
        forceLoggedIn
    ],addProposalStationRouteHandler);


    // Relationship Self
    router.delete('/:id/relationships/stations/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return dropProposalStationRouteHandler(req, res, 'self');
    });
    router.get('/:id/relationships/stations/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationRouteHandler(req,res,'self');
    });
    router.get('/:id/relationships/stations', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationsRouteHandler(req,res,'self');
    });

    // Relationship Related
    router.delete('/:id/stations/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return dropProposalStationRouteHandler(req, res, 'related');
    });
    router.get('/:id/stations/:relationId', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationRouteHandler(req,res,'related');
    });
    router.get('/:id/stations', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationsRouteHandler(req,res,'related');
    });

    /**
     * Station Routes
     **/
    // Station Routes
    router.get('/:id', [forceLoggedIn], getProposalRouteHandler);
    router.post('/:id', [forceLoggedIn], editProposalRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropProposalRouteHandler);

    router.post('/', [forceLoggedIn], addProposalRouteHandler);
    router.get('/', [forceLoggedIn], getProposalsRouteHandler);

    return router;
}
