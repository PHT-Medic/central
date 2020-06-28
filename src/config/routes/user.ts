import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../services/router/middleware/authMiddleware';

import UserController from "../../controllers/user/UserController";
import UserPermissionController, {getUserPermissions} from "../../controllers/user/permission/UserPermissionController";

import {check} from "express-validator";

//---------------------------------------------------------------------------------

/**
 * User Permission Routes
 */
router.delete('/:userId/relationships/permissions/:permissionId', [forceLoggedIn], UserPermissionController.dropUserPermission);
router.post('/:userId/relationships/permissions', [
    forceLoggedIn,
    check('permission_id')
        .exists()
        .isInt()
],UserPermissionController.addUserPermission);

// Relationship Self
router.get('/:userId/relationships/permissions/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return UserPermissionController.getUserPermission(req,res,'self', false);
});
router.get('/:userId/relationships/permissions', forceLoggedIn, (req: any, res: any) => {
    return UserPermissionController.getUserPermissions(req,res,'self', false);
});

// Relationship Related
router.get('/:userId/permissions/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return UserPermissionController.getUserPermission(req,res,'related', false);
});
router.get('/:userId/permissions', forceLoggedIn, (req: any, res: any) => {
    return UserPermissionController.getUserPermissions(req,res,'related', false);
});

/**
 * User Ability Routes
 */

router.get('/:userId/abilities/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return UserPermissionController.getUserPermission(req,res,'self', true);
});
router.get('/:userId/abilities', forceLoggedIn, (req: any, res: any) => {
    return UserPermissionController.getUserPermissions(req,res,'self', true);
});

/**
 * User Routes
 */
// Details Routes
router.get('/:id', [forceLoggedIn], UserController.getUser);
router.post('/:id', [forceLoggedIn], UserController.editUser);
router.delete('/:id', [forceLoggedIn], UserController.dropUser);

// Collection Routes
router.post('/', [
    forceLoggedIn,
    check('name')
        .exists()
        .isString()
        .isLength({
            min: 5,
            max: 30
        }),

    check('email')
        .exists()
        .isEmail()
        .normalizeEmail(),

    check('password')
        .exists()
        .isString()
        .isLength({
            min: 5,
            max: 255
        })
], UserController.addUser);

router.get('/', [
    forceLoggedIn
], UserController.getUsers);

//---------------------------------------------------------------------------------

export default router;
