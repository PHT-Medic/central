import LayoutModule from '~/modules/layout';
import { LayoutNavigationDefaultId } from "~/config/layout";
import {ActionTree, GetterTree, MutationTree} from "vuex";
import {RootState} from "~/store/index";
import {
    LayoutComponent,
    LayoutNavigationComponentInterface,
    LayoutSidebarComponentInterface
} from "~/modules/layout/types";

// --------------------------------------------------------------------

export interface LayoutState {
    navigationComponents: LayoutNavigationComponentInterface[],
    navigation: LayoutNavigationComponentInterface | undefined,
    navigationId: string,

    sidebarComponents: LayoutSidebarComponentInterface[]
}

export const state = () : LayoutState => ({
    navigationComponents: LayoutModule.getNavigation(),
    navigation: LayoutModule.getNavigationById(LayoutNavigationDefaultId),
    navigationId: LayoutNavigationDefaultId,

    sidebarComponents: [],
});

export const getters : GetterTree<LayoutState, RootState> = {
    navigationComponents: (state) => {
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

export const actions : ActionTree<LayoutState, RootState> = {
    selectNavigation ({ commit, state, dispatch }, id: string) {
        id = id === undefined ? LayoutNavigationDefaultId : id;

        if (state.navigationId === id && state.sidebarComponents.length > 0) {
            return;
        }

        const navigation = LayoutModule.getNavigationById(id);

        if(typeof navigation === 'undefined') {
            return;
        }

        commit('setNavigationId', id);
        commit('setNavigation', navigation);

        const sidebarComponents = LayoutModule.getSidebarById(id);
        commit('setSidebarComponents', sidebarComponents);

        dispatch('update'); // navigation update also required, for init page load to render nav bar correctly (loggedIn).
    },

    /**
     * Update sidebar & navigation components.
     *
     * @param dispatch
     */
    update({dispatch}) {
        dispatch('reduceComponents', {type: 'sidebar'});
        dispatch('reduceComponents', {type: 'navigation'});
    },

    /**
     * Reduce sidebar or navigation components by login state, permissions, ...
     *
     * @param commit
     * @param state
     * @param rootGetters
     * @param type
     */
    reduceComponents(
        {commit, state, rootGetters},
        {type} : {type: string}
    ) {
        let components: LayoutComponent[] = [];

        switch (type) {
            case 'sidebar':
                components = LayoutModule.getSidebarById(state.navigationId);
                break;
            case 'navigation':
                components = LayoutModule.getNavigation();
                break;
        }

        components = LayoutModule.reduceComponents({
            components,
            loggedIn: rootGetters['auth/loggedIn'],
            can: this.$auth.can.bind(this.$auth)
        });

        switch (type) {
            case 'sidebar':
                commit('setSidebarComponents', components);
                break;
            case 'navigation':
                commit('setNavigationComponents', components);
                break;
        }
    }
};

export const mutations : MutationTree<LayoutState> = {
    setNavigationId (state, id) {
        state.navigationId = id
    },
    setNavigation (state, navigation) {
        state.navigation = navigation;
    },
    setNavigationComponents(state, components) {
        state.navigationComponents = components;
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
