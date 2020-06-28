import { AuthStorage } from '../services/auth/storage';

const check = ({route, app}) => {

};

const checkAbility = ({route, app}) => {
    if(
        route.meta.some(m => m.hasOwnProperty('requiresAbility') && m.requireAbility) ||
        route.matched.some(m => m.hasOwnProperty('requiresAbility') && m.requireAbility)
    ) {
        let isAllowed = true;

        let keys = ['meta','matched'];
        for(let l=0; l<keys.length; l++) {
            for(let i=0; i < route.meta.length; i++) {
                let value = route.meta[i].requireAbility ?? null;

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
                throw new Error('Die Route ist geschützt und für Sie nicht zugänglich.');
            }
        }
    }
}

export default function ({ app , route, redirect }) {
    if (
        route.meta.some(m => m.requireLoggedIn) ||
        route.matched.some(record => record.meta.requireLoggedIn)
    ) {
        let user;

        // jwt accessToken not set, redirect to login route.
        if (AuthStorage.getToken() == null) {
            redirect({
                path: '/login',
                query: { redirect: route.fullPath }
            });
        }

        try {
            checkAbility({route, app});
        } catch (e) {
            redirect({ path: '/' });
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
