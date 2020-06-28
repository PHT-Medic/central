import { LayoutService } from '../services/layout';
import { defaultNavigationId } from "../config/layout";

// --------------------------------------------------------------------

const state = () => ({
    navigationComponents: LayoutService.getNavigation(),
    navigation: LayoutService.getNavigationById(defaultNavigationId),
    navigationId: defaultNavigationId,

    sidebarComponents: [],
});

const getters = {
    navigationComponents: (state, getters) => {
        return state.navigationComponents;
    },
    navigation: (state) => {
        return state.navigation;
    },
    navigationId: (state) => {
        return state.navigationId
    },
    sidebarComponents: (state, getters) => {
        return state.sidebarComponents;
    },

};

const actions = {
    selectNavigation ({ commit, state }, id) {
        id = id === undefined ? defaultNavigationId : id;

        if (state.navigationId === id && state.sidebarComponents.length > 0) {
            return;
        }

        const navigation = LayoutService.getNavigationById(id);
        commit('setNavigationId', id);
        commit('setNavigation', navigation);

        const sidebarComponents = LayoutService.getSidebarById(id);
        commit('setSidebarComponents', sidebarComponents)
    }
};

const mutations = {
    setNavigationId (state, id) {
        state.navigationId = id
    },
    setNavigation (state, navigation) {
        state.navigation = navigation;
    },

    setSidebarComponents (state, menu) {
        state.sidebarComponents = menu;
    }
};

// --------------------------------------------------------------------

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
