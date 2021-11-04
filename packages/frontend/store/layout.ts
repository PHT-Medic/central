/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ActionTree, GetterTree, MutationTree} from "vuex";
import {reduceComponents} from "../modules/layout/components";
import {getNavigationComponentById, getNavigationComponents} from "../modules/layout/navigation";
import {getSidebarComponentsForNavigationId} from "../modules/layout/sidebar";
import {RootState} from "./index";
import {
    LayoutComponent,
    LayoutNavigationComponent, LayoutNavigationIDType,
    LayoutSidebarComponent
} from "../modules/layout/types";
import {LayoutNavigationID} from "../modules/layout/contants";

// --------------------------------------------------------------------

export interface LayoutState {
    initialized: boolean,

    navigationComponents: LayoutNavigationComponent[],
    navigation: LayoutNavigationComponent | undefined,
    navigationId: LayoutNavigationIDType,

    sidebarComponents: LayoutSidebarComponent[]
}

export const state = () : LayoutState => ({
    initialized: false,

    navigationComponents: getNavigationComponents(),
    navigation: getNavigationComponentById(LayoutNavigationID.DEFAULT),
    navigationId: LayoutNavigationID.DEFAULT,

    sidebarComponents: [],
});

export const getters : GetterTree<LayoutState, RootState> = {
    navigationComponents: (state) => {
        return state.navigationComponents;
    },
    navigation: (state) => {
        return state.navigation;
    },
    navigationId: (state) : LayoutNavigationIDType => {
        return state.navigationId
    },

    sidebarComponents: (state) => {
        return state.sidebarComponents;
    },

};

export const actions : ActionTree<LayoutState, RootState> = {
    selectNavigation ({ commit, state, dispatch }, id?: LayoutNavigationID) {
        if (
            state.initialized &&
            state.navigationId === id
        ) {
            return state.sidebarComponents;
        }

        const navigation = getNavigationComponentById(id);

        if(typeof navigation === 'undefined') {
            console.log('layout navigation not found...');
            return state.sidebarComponents;
        }

        commit('setNavigationId', id);
        commit('setNavigation', navigation);

        dispatch('update'); // navigation update also required, for init page load to render nav bar correctly (loggedIn).

        commit('setInitialized', true);

        return state.sidebarComponents;
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
                components = [...getSidebarComponentsForNavigationId(state.navigationId)]
                break;
            case 'navigation':
                components = [...getNavigationComponents()];
                break;
        }

        components = reduceComponents(components, {
            loggedIn: rootGetters['auth/loggedIn'],
            auth: this.$auth
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
    setInitialized(state, value) {
        state.initialized = value;
    },
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
