import {defaultSidebarId} from "../config/layout";

export default function ({ store, route }) {
    let key = 'sidebarId';
    let sidebarId = null;

    for(let i=0; i< route.meta.length; i++) {
        if (key in route.meta[i] && route.meta[i][key]) {
            sidebarId = route.meta[i][key]
        }
    }

    if(!sidebarId) {
        for(let i=0; i< route.matched.length; i++) {
            if (key in route.matched[i] && route.matched[i][key]) {
                sidebarId = route.matched[key]
            }
        }
    }

    sidebarId = sidebarId ?? defaultSidebarId;

    if(sidebarId) {
        store.dispatch('layout/selectSidebar', sidebarId)
    }
}
