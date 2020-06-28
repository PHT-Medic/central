import {defaultNavigationId} from "../config/layout";

export default function ({ store, route }) {
    let key = 'navigationId';
    let navigationId = null;

    for(let i=0; i< route.meta.length; i++) {
        if (key in route.meta[i] && route.meta[i][key]) {
            navigationId = route.meta[i][key]
        }
    }

    if(!navigationId) {
        for(let i=0; i< route.matched.length; i++) {
            if (key in route.matched[i] && route.matched[i][key]) {
                navigationId = route.matched[key]
            }
        }
    }

    navigationId = navigationId ?? defaultNavigationId;

    if(navigationId) {
        store.dispatch('layout/selectNavigation', navigationId)
    }
}
