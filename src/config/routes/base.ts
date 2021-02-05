import { Router } from 'express';
let router = Router();

import {forceLoggedIn} from "../../modules/http/request/middleware/authMiddleware";
import {getMeRouteHandler} from "../../app/controllers/user/UserController";
import {getRepository} from "typeorm";
import {TrainResult} from "../../domains/pht/train/result";
import {postHookRouteHandler} from "../../app/controllers/hook/HookController";
import {MasterImage} from "../../domains/pht/master-image";

router.get('/me', [forceLoggedIn], getMeRouteHandler);
router.post('/hook', [], postHookRouteHandler);

router.get('/',(req: any, res: any) => {
    return res._respond({
        data: {
            version: '1.0'
        }
    })
});

router.get('/test', async (req,res) => {
    res.json(await getRepository(MasterImage).insert([
        {external_tag_id: 'isicdemo', name: 'isicdemo'},
        {external_tag_id: 'nfdemo', name: 'nfdemo'}
    ]));
});

export default router;
