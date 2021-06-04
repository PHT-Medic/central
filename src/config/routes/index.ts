import { Application } from 'express';

import baseRoutes from './base';
import permissionRoutes from './permission';
import tokenRoutes from './token';
import roleRoutes from './role';
import userRoutes from './user';
import setupAuthRoutes from "./auth";
import registerPhtRoutes from "./pht";
import {setupUserKeyRingRoutes} from "./user-key-ring";
import setupServiceRoutes from "./service";

const register = (router: Application) => {

    router.use('/permissions', permissionRoutes);
    router.use('/token', tokenRoutes);
    router.use('/users', userRoutes);
    router.use('/user-key-rings', setupUserKeyRingRoutes());
    router.use('/roles', roleRoutes);
    router.use('/auth', setupAuthRoutes());
    router.use('/pht', registerPhtRoutes());
    router.use('/service', setupServiceRoutes());
    router.use('/', baseRoutes);
};

export default {
    register
}
