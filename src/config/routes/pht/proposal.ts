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
} from "../../../app/controllers/pht/proposal-station/ProposalStationController";

export function setupPhtProposalRoutes() {
    const router = Router();

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
