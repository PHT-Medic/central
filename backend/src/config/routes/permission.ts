import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../modules/http/request/middleware/authMiddleware';

import PermissionController from "../../app/controllers/auth/permission/PermissionController";
import {check} from "express-validator";

//---------------------------------------------------------------------------------

router.post('/:id', [
    forceLoggedIn,

    check('name')
        .exists()
        .isString()
        .isLength({
            min: 5,
            max: 30
        }),

], PermissionController.editPermission);
router.delete('/:id', forceLoggedIn, PermissionController.dropPermission);
router.get('/:id', forceLoggedIn, PermissionController.getPermission);

router.post('/', [
    forceLoggedIn,

    check('name')
        .exists()
        .isString()
        .isLength({
            min: 5,
            max: 30
        }),
], PermissionController.addPermission);
router.get('/', forceLoggedIn, PermissionController.getPermissions);

//---------------------------------------------------------------------------------

export default router;
