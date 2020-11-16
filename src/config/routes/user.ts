import { Router } from 'express';
let router = Router();

//---------------------------------------------------------------------------------
import { forceLoggedIn } from '../../services/router/middleware/authMiddleware';

import UserController from "../../controllers/user/UserController";

import {check} from "express-validator";

//--------------------------------------------------------------------------------

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
