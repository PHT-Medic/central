import {Context, Middleware} from "@nuxt/types";

const checkAbility = ({route, $auth} : Context) => {
    if(
        route.meta.some((m: any) => m.hasOwnProperty('requireAbility') && m.requireAbility) ||
        route.matched.some((m: any) => m.hasOwnProperty('requireAbility') && m.requireAbility)
    ) {
        let isAllowed = true;

        let keys: string[] = ['meta','matched'];
        for(let l=0; l<keys.length; l++) {
            let key = keys[l];
            // @ts-ignore
            for(let i=0; i < route[key].length; i++) {
                // @ts-ignore
                let value = route[key][i].requireAbility ?? null;

                if(!value) {
                    continue;
                }

                if(typeof value === 'function' && !value($auth.can.bind($auth))) {
                    isAllowed = false;
                    break;
                }

                if(typeof value === 'boolean' && !value) {
                    isAllowed = false;
                    break;
                }
            }

            if(!isAllowed) {
                throw new Error('Die Route ist geschützt und für Sie nicht zugänglich.');
            }
        }
    }
}

const authMiddleware : Middleware = ({ route, redirect, $auth, store } : Context) => {
    if (
        route.meta.some((m: any) => m.requireLoggedIn) ||
        route.matched.some((record: any) => record.meta.requireLoggedIn)
    ) {
        if (!store.getters['auth/loggedIn']) {
            redirect({
                path: '/login',
                query: { redirect: route.fullPath }
            });
        }

        try {
            checkAbility({route, $auth} as Context);
        } catch (e) {
            redirect({ path: '/' });
        }

        return;
    }

    if (
        route.meta.some((m: any) => m.requireGuestState) ||
        route.matched.some((record: any) => record.meta.requireGuestState)
    ) {
        if (store.getters['auth/loggedIn']) {
            redirect({ path: '/' });
        }
    }
};

export default authMiddleware;
