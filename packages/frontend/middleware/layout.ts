import {LayoutNavigationDefaultId} from "~/config/layout";
import {Context} from "@nuxt/types";

export default function layoutMiddleware({ store, route } : Context) {
    let key : string = 'navigationId';
    let navigationId : string | undefined;

    if(route.meta) {
        for (let i = 0; i < route.meta.length; i++) {
            if (key in route.meta[i] && route.meta[i][key]) {
                navigationId = route.meta[i][key]
            }
        }
    }

    if(typeof navigationId === 'undefined') {
        for(let i=0; i< route.matched.length; i++) {
            if (key in route.matched[i]) {
                // @ts-ignore
                navigationId = route.matched[i][key];
            }
        }
    }

    if(typeof navigationId === 'undefined') {
        navigationId = LayoutNavigationDefaultId;
    }

    return store.dispatch('layout/selectNavigation', navigationId).then(r => r)
}
