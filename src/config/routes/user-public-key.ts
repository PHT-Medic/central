import {Router} from "express";
import {forceLoggedIn} from "../../services/http/request/middleware/authMiddleware";
import {
    addUserPublicKeyRouteHandler,
    dropUserPublicKeyRouteHandler,
    editUserPublicKeyRouteHandler, getUserPublicKeyRouteHandler
} from "../../controllers/user/public-key/UserPublicKeyController";

export function setupUserPublicKeyRoutes() {
    const router = Router();

    /**
     * User Public Key Routes
     */
    // Details Routes
    router.post('/:id', [forceLoggedIn], editUserPublicKeyRouteHandler);
    router.delete('/:id', [forceLoggedIn], dropUserPublicKeyRouteHandler);

    router.post('', [forceLoggedIn], addUserPublicKeyRouteHandler);
    router.get('', [forceLoggedIn], getUserPublicKeyRouteHandler);

    return router;
}
