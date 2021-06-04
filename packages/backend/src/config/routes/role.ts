import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../modules/http/request/middleware/authMiddleware';

import RoleController from "../../app/controllers/auth/role/RoleController";
import RolePermissionController from "../../app/controllers/auth/role/permission/RolePermissionController";
import {getRoleUsersRouteHandler} from "../../app/controllers/auth/role/user/RoleUserController";

//---------------------------------------------------------------------------------

/**
 * Role Ability Routes
 */

router.get('/:roleId/abilities/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return RolePermissionController.getRolePermission(req,res,'self', true);
});
router.get('/:roleId/abilities', forceLoggedIn, (req: any, res: any) => {
    return RolePermissionController.getRolePermissions(req,res,'self', true);
});

/**
 * User Permission Routes
 */
router.delete('/:roleId/relationships/permissions/:permissionId', [forceLoggedIn], RolePermissionController.dropRolePermission);
router.post('/:roleId/relationships/permissions', [
    forceLoggedIn
],RolePermissionController.addRolePermission);

// Relationship Self
router.get('/:roleId/relationships/permissions/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return RolePermissionController.getRolePermission(req,res,'self', false);
});
router.get('/:roleId/relationships/permissions', [forceLoggedIn], (req: any, res: any) => {
    return RolePermissionController.getRolePermissions(req,res,'self', false);
});

// Relationship Related
router.get('/:roleId/permissions/:permissionId', [forceLoggedIn], (req: any, res: any) => {
    return RolePermissionController.getRolePermission(req,res,'related', false);
});
router.get('/:roleId/permissions', [forceLoggedIn], (req: any, res: any) => {
    return RolePermissionController.getRolePermissions(req,res,'related', false);
});

/**
 * Role Users Routes
 */
router.get('/:roleId/relationships/users', [forceLoggedIn], (req: any, res: any) => {
    return getRoleUsersRouteHandler(req,res,'self');
});

// Relationship Related
router.get('/:roleId/users', [forceLoggedIn], (req: any, res: any) => {
    return getRoleUsersRouteHandler(req,res,'related');
});

/**
 * User Routes
 */
// Details Routes
router.get('/:id', [forceLoggedIn], RoleController.getRole);
router.post('/:id', [forceLoggedIn], RoleController.editRole);
router.delete('/:id', [forceLoggedIn], RoleController.dropRole);

// Collection Routes
router.post('/', [
    forceLoggedIn,
], RoleController.addRole);

router.get('/', [
    forceLoggedIn
], RoleController.getRoles);

//---------------------------------------------------------------------------------

export default router;
