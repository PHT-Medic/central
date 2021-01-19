import {Router} from "express";
import {forceLoggedIn} from "../../modules/http/request/middleware/authMiddleware";
import {
    addUserKeyRouteHandler,
    dropUserKeyRouteHandler,
    editUserKeyRouteHandler, getUserKeyRouteHandler
} from "../../app/controllers/user/key/UserKeyController";

export function setupUserKeyRingRoutes() {
    const router = Router();

    /**
     * User Public Key Routes
     */
    // Details Routes
    router.post('/:id', [forceLoggedIn], editUserKeyRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropUserKeyRouteHandler);

    router.post('', [forceLoggedIn], addUserKeyRouteHandler);
    router.get('', [forceLoggedIn], getUserKeyRouteHandler);

    return router;
}
