import {LayoutNavigationDefaultId} from "~/config/layout";
import {Context, Middleware} from "@nuxt/types";

const layoutMiddleware : Middleware = ({ store, route } : Context) => {
    let key = 'navigationId';
    let navigationId = null;

    for(let i=0; i< route.meta.length; i++) {
        if (key in route.meta[i] && route.meta[i][key]) {
            navigationId = route.meta[i][key]
        }
    }

    if(!navigationId) {
        for(let i=0; i< route.matched.length; i++) {
            if (key in route.matched[i]) {
                // @ts-ignore
                navigationId = route.matched[i][key];
            }
        }
    }

    navigationId = navigationId ?? LayoutNavigationDefaultId;

    if(navigationId) {
        store.dispatch('layout/selectNavigation', navigationId).then(r => r)
    }
}

export default layoutMiddleware;
