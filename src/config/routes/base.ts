import { Router } from 'express';
let router = Router();

import {forceLoggedIn} from "../../modules/http/request/middleware/authMiddleware";
import {getMeRouteHandler} from "../../app/controllers/auth/user/UserController";
import {getRepository, In} from "typeorm";
import {TrainResult} from "../../domains/pht/train/result";

router.get('/me', [forceLoggedIn], getMeRouteHandler);

router.get('/',(req: any, res: any) => {
    return res._respond({
        data: {
            version: '1.0'
        }
    })
});

router.get('/test', async (req,res) => {
    res.json(await getRepository(TrainResult).delete({
        //status: In([TrainResultStateFailed, TrainResultStateExtracting])
    }));
});

export default router;
