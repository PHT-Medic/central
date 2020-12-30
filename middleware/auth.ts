import {Context, Middleware} from "@nuxt/types";

type MetaOrMatched = 'meta' | 'matched';

function checkAbility({route, $auth} : Context) {
    if(
        route.meta.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function') ||
        route.matched.some((m: any) => m.hasOwnProperty('requireAbility') && typeof m.requireAbility === 'function')
    ) {
        let isAllowed = true;

        const can : CallableFunction = $auth.can.bind($auth);

        const keys: MetaOrMatched[] = ['meta','matched'];
        for(let l=0; l<keys.length; l++) {
            const key : MetaOrMatched = keys[l];
            for(let i=0; i < route[key].length; i++) {
                const value : any = typeof route[key][i].requireAbility === 'function' ? route[key][i].requireAbility : undefined;

                if(typeof value === 'undefined') {
                    continue;
                }

                if(typeof value === 'function') {
                    isAllowed = value(can);
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
            await $auth.loadMe();
        } catch (e) {
            console.log(e);
            return redirect('/logout');
        }
    }

    if (
        route.meta.some((m: any) => m.requireLoggedIn) ||
        route.matched.some((record: any) => record.meta.requireLoggedIn)
    ) {
        if (!store.getters['auth/loggedIn']) {
            return redirect({
                path: '/login',
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
        route.meta.some((m: any) => m.requireGuestState) ||
        route.matched.some((record: any) => record.meta.requireGuestState)
    ) {
        if (store.getters['auth/loggedIn']) {
            redirect({ path: '/' });
        }
    }
};

export default authMiddleware;
