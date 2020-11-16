import { Application } from 'express';

import baseRoutes from './base';
import permissionRoutes from './permission';
import tokenRoutes from './token';
import roleRoutes from './role';
import userRoutes from './user';

const register = (router: Application) => {

    router.use('/permissions', permissionRoutes);
    router.use('/token', tokenRoutes);
    router.use('/users', userRoutes);
    router.use('/roles', roleRoutes);
    router.use('/', baseRoutes);
};

export default {
    register
}
