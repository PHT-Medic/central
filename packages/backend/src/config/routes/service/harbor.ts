import {Router} from "express";
import {forceLoggedIn} from "../../../modules/http/request/middleware/authMiddleware";
import {postHarborHookRouteHandler} from "../../../app/controllers/service/harbor/HarborController";

export function setupHarborRoutes() {
    const router = Router();

    /**
     * User Public Key Routes
     */
    // Details Routes
    router.post('/hook', [forceLoggedIn], postHarborHookRouteHandler);

    return router;
}
