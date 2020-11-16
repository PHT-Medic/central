import { Router } from 'express';
let router = Router();

import {forceLoggedIn} from "../../services/router/middleware/authMiddleware";
import UserController from "../../controllers/user/UserController";
import {KeyCloakProvider} from "../../services/auth/providers/keycloak";
import UserRoleModel from "../../domains/user/role/UserRoleModel";
import UserModel from "../../domains/user/UserModel";
import UserProviderModel from "../../domains/user/provider/UserProviderModel";
import RolePermissionModel from "../../domains/role/permission/RolePermissionModel";
import RoleModel from "../../domains/role/RoleModel";

router.get('/me', [forceLoggedIn], UserController.getMe);
router.get('/',(req: any, res: any) => {
    return res._respond({
        data: {
            version: '1.0'
        }
    })
});

router.get('/test', async (req,res) => {
    res.json(await UserProviderModel().findAll());
});

export default router;
