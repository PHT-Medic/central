import { Application } from 'express';

import baseRoutes from './base';
import permissionRoutes from './permission';
import tokenRoutes from './token';
import roleRoutes from './role';
import userRoutes from './user';
import setupAuthRoutes from "./auth";
import registerPhtRoutes from "./pht";
import {setupUserPublicKeyRoutes} from "./user-public-key";

const register = (router: Application) => {

    router.use('/permissions', permissionRoutes);
    router.use('/token', tokenRoutes);
    router.use('/users', userRoutes);
    router.use('/user-public-keys', setupUserPublicKeyRoutes());
    router.use('/roles', roleRoutes);
    router.use('/auth', setupAuthRoutes());
    router.use('/pht', registerPhtRoutes());
    router.use('/', baseRoutes);
};

export default {
    register
}
