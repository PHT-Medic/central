import Vue from 'vue';
import Router from 'vue-router';

import routerGuard from "./RouterGuard";
import register from '../../routes/regsitry';

Vue.use(Router);

let router = new Router({
    mode: 'history',
    routes: register
});

routerGuard(router);

export default router