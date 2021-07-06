import {Context, Middleware} from "@nuxt/types";
import AuthModule from "~/modules/auth";

type MetaOrMatched = 'meta' | 'matched';

function checkAbility({route, $auth} : Context) {
    if(
        (route.meta && route.meta.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function')) ||
        route.matched.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function')
    ) {
        let isAllowed = true;

        const can : CallableFunction = $auth.can.bind($auth);

        const keys: MetaOrMatched[] = ['meta','matched'];
        for(let l=0; l<keys.length; l++) {
            const key : MetaOrMatched = keys[l];

            const value = route[key];

            if(typeof value === 'undefined') continue;

            for(let i=0; i < value.length; i++) {
                const val : any = typeof value[i].requireAbility === 'function' ? value[i].requireAbility : undefined;

                if(typeof val === 'undefined') {
                    continue;
                }

                if(typeof val === 'function') {
                    isAllowed = val(can);
                    break;
                }
            }

            if(!isAllowed) {
                const parts = route.path.split('/');

                parts.pop();

                throw new Error(parts.join('/'));
            }
        }
    }
}

const authMiddleware : Middleware = async ({ route, redirect, $auth, store } : Context) => {
    if (!route.path.includes('/logout')) {
        try {
            await (<AuthModule> $auth).resolveMe();
        } catch (e) {
            return redirect('/logout');
        }
    }

    if (
        (route.meta && route.meta.some((m: any) => m.requireLoggedIn)) ||
        route.matched.some((record: any) => record.meta.requireLoggedIn)
    ) {
        if (!store.getters['auth/loggedIn']) {
            return redirect({
                path: '/logout',
                query: { redirect: route.fullPath }
            });
        }

        try {
            checkAbility({route, $auth} as Context);
        } catch (e) {
            return redirect({ path: e.message });
        }
    }

    if (
        (route.meta && route.meta.some((m: any) => m.requireGuestState)) ||
        route.matched.some((record: any) => record.meta.requireGuestState)
    ) {
        if (store.getters['auth/loggedIn']) {
            redirect({ path: '/' });
        }
    }
};

export default authMiddleware;
