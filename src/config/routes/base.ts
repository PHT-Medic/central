import { Router } from 'express';
let router = Router();

import {forceLoggedIn} from "../../services/http/request/middleware/authMiddleware";
import {getMeRouteHandler} from "../../controllers/user/UserController";
import {getRepository} from "typeorm";
import {UserAccount} from "../../domains/user/account";

router.get('/me', [forceLoggedIn], getMeRouteHandler);
router.get('/',(req: any, res: any) => {
    return res._respond({
        data: {
            version: '1.0'
        }
    })
});

router.get('/test', async (req,res) => {
    res.json(await getRepository(UserAccount).find());
});

export default router;
