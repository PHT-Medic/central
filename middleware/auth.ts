import {Context, Middleware} from "@nuxt/types";
import {AuthAbstractUserInfoResponse} from "~/modules/auth/types";

type MetaOrMatched = 'meta' | 'matched';

const checkAbility = ({route, $auth} : Context) => {
    if(
        route.meta.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function') ||
        route.matched.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function')
    ) {
        let isAllowed = true;


        let keys: MetaOrMatched[] = ['meta','matched'];
        for(let l=0; l<keys.length; l++) {
            let key : MetaOrMatched = keys[l];
            for(let i=0; i < route[key].length; i++) {
                let value : any = typeof route[key][i].requireAbility === 'function' ? route[key][i].requireAbility : undefined;

                if(typeof value === 'undefined') {
                    continue;
                }

                if(typeof value === 'function') {
                    isAllowed = value($auth.can.bind($auth));
                    break;
                }
            }

            if(!isAllowed) {
                throw new Error('Die Route ist geschützt und für Sie nicht zugänglich.');
            }
        }
    }
}

const authMiddleware : Middleware = async ({ route, redirect, $auth, store } : Context) => {
    await $auth.resolveMe();

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
