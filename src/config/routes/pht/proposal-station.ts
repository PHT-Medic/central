import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {
    addProposalStationRouteHandler,
    dropProposalStationRouteHandler,
    editProposalStationRouteHandler,
    getProposalStationRouteHandler, getProposalStationsRouteHandler
} from "../../../app/controllers/pht/proposal-station/ProposalStationController";

export function setupPhtProposalStationRoutes() {
    const router = Router();

    router.get('/:id', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationRouteHandler(req,res);
    });
    router.post('/:id', [forceLoggedIn], (req: any, res: any) => {
        return editProposalStationRouteHandler(req, res);
    });
    router.delete('/:id', [forceLoggedIn], (req: any, res: any) => {
        return dropProposalStationRouteHandler(req, res);
    });

    router.get('/', [forceLoggedIn], (req: any, res: any) => {
        return getProposalStationsRouteHandler(req,res);
    })
    router.post('/', [
        forceLoggedIn
    ],addProposalStationRouteHandler);

    return router;
}
