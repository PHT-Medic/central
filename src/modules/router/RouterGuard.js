import {AuthStorage} from "../auth/AuthStorage";

export default function routerGuard(router) {
    router.beforeEach((to, from, next) => {
        if(to.matched.some(record => record.meta.requiresAuth)) {
            let user;

            // jwt token not set, redirect to login route.
            if (AuthStorage.getToken() == null) {
                next({
                    path: '/login',
                    query: { redirect: to.fullPath }
                });
            } else {
                if(to.matched.some(record => record.meta.requiresAdminRights)) {
                    if((user = AuthStorage.getUser()) !== null) {
                        if (user.isAdmin === 1) {
                            next();
                        }
                    }

                    next({name: 'dashboard'});
                }else {
                    next();
                }
            }
        } else if(to.matched.some(record => record.meta.requiresGuestState)) {
            if(AuthStorage.getToken() == null){
                next()
            } else {
                next({ name: 'dashboard'});
            }
        } else {
            next()
        }
    });
}