import { Application } from 'express';
import routes from "../../config/routes";

import responseMiddleware from "../http/response/middleware/responseMiddleware";
let { checkAuthenticated } = require('../http/request/middleware/authMiddleware');

const registerRoutes = (router: Application) => {
    router.use(responseMiddleware);
    router.use(checkAuthenticated);

    routes.register(router);
};

export default {
    registerRoutes
};
