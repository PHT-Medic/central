import { AuthStorage } from './../services/authStorage';

export default function ({ app , route, redirect }) {
    if (
        route.meta.some(m => m.requiresAuth) ||
        route.matched.some(record => record.meta.requiresAuth)
    ) {
        let user;

        // jwt accessToken not set, redirect to login route.
        if (AuthStorage.getToken() == null) {
            redirect({
                path: '/login',
                query: { redirect: route.fullPath }
            });
        } else if (route.matched.some(record => record.meta.requiresAdminRights)) {
            if ((user = AuthStorage.getUser()) !== null) {
                if (user.isAdmin === 1) {
                    return;
                }
            }

            redirect({ path: '/' });
        }

        if(
            route.meta.some(m => m.requiresAbility) ||
            route.matched.some(m => m.requiresAbility)
        ) {
            let isAllowed = true;

            let keys = ['meta','matched'];
            for(let l=0; l<keys.length; l++) {
                for(let i=0; i < route.meta.length; i++) {
                    let value = route.meta[i].requiresAbility ?? null;

                    if(!value) {
                        continue;
                    }

                    if(typeof value === 'function' && !value(app.$can)) {
                        isAllowed = false;
                        break;
                    }

                    if(typeof value === 'boolean' && !value) {
                        isAllowed = false;
                        break;
                    }
                }

                if(!isAllowed) {
                    redirect({ path: '/' });
                }
            }
        }

        return;
    }

    if (
        route.meta.some(m => m.requiresGuestState) ||
        route.matched.some(record => record.meta.requiresGuestState)
    ) {
        if (AuthStorage.getToken()) {
            redirect({ path: '/' });
        }
    }
};
