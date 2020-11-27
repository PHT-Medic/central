import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../services/http/request/middleware/authMiddleware';

import TokenController from "../../controllers/token/TokenController";

//---------------------------------------------------------------------------------

router.post('/', TokenController.grantToken);
router.delete('/', [forceLoggedIn], TokenController.revokeToken);

//---------------------------------------------------------------------------------

export default router;
