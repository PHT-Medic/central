import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../modules/http/request/middleware/authMiddleware';

import {check} from "express-validator";
import {
    addUserRouteHandler,
    dropUserRouteHandler,
    editUserRouteHandler,
    getUserRouteHandler, getUsersRouteHandler
} from "../../app/controllers/user/UserController";
import {
    addUserRoleRouteHandler, dropUserRoleRouteHandler,
    getUserRoleRouteHandler,
    getUserRolesRouteHandler
} from "../../app/controllers/user/role/UserRoleController";
import {
    addUserKeyRouteHandler, dropUserKeyRouteHandler, editUserKeyRouteHandler,
    getUserKeyRouteHandler
} from "../../app/controllers/user/key/UserKeyController";

//--------------------------------------------------------------------------------

/**
 * User Roles Routes
 */

router.post('/:id/relationships/roles', [
    forceLoggedIn
],addUserRoleRouteHandler);


// Relationship Self
router.delete('/:id/relationships/roles/:relationId', [forceLoggedIn], (req: any, res: any) => {
    return dropUserRoleRouteHandler(req, res, 'self');
});
router.get('/:id/relationships/roles/:relationId', [forceLoggedIn], (req: any, res: any) => {
    return getUserRoleRouteHandler(req,res,'self');
});
router.get('/:id/relationships/roles', [forceLoggedIn], (req: any, res: any) => {
    return getUserRolesRouteHandler(req,res,'self');
});

// Relationship Related
router.delete('/:id/roles/:relationId', [forceLoggedIn], (req: any, res: any) => {
    return dropUserRoleRouteHandler(req, res, 'related');
});
router.get('/:id/roles/:relationId', [forceLoggedIn], (req: any, res: any) => {
    return getUserRoleRouteHandler(req,res,'related');
});
router.get('/:id/roles', [forceLoggedIn], (req: any, res: any) => {
    return getUserRolesRouteHandler(req,res,'related');
});

/**
 * User Routes
 */
// Details Routes
router.get('/:id', [forceLoggedIn], getUserRouteHandler);
router.post('/:id', [forceLoggedIn], editUserRouteHandler);
router.delete('/:id', [forceLoggedIn], dropUserRouteHandler);
router.post('/', [forceLoggedIn], addUserRouteHandler);

router.get('/', [
    forceLoggedIn
], getUsersRouteHandler);

//---------------------------------------------------------------------------------

export default router;
