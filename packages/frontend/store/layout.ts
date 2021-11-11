/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ActionTree, GetterTree, MutationTree} from "vuex";
import {buildComponents, isLayoutComponentMatch, reduceComponents} from "../modules/layout/components";
import {getNavigationComponentById, getNavigationComponents} from "../modules/layout/navigation";
import {getSidebarComponentsForNavigationId} from "../modules/layout/sidebar";
import {RootState} from "./index";
import {
    LayoutComponent, LayoutComponentType,
    LayoutNavigationComponent, LayoutNavigationIDType,
    LayoutSidebarComponent
} from "../modules/layout/types";
import {LayoutNavigationID} from "../modules/layout/contants";

// --------------------------------------------------------------------

export interface LayoutState {
    initialized: boolean,

    navigationComponents: LayoutNavigationComponent[],
    navigationComponent: LayoutNavigationComponent | undefined,

    sidebarComponents: LayoutSidebarComponent[],
    sidebarComponent: LayoutSidebarComponent | undefined
}

export const state = () : LayoutState => ({
    initialized: false,

    navigationComponents: [],
    navigationComponent: undefined,

    sidebarComponents: [],
    sidebarComponent: undefined
});

export const getters : GetterTree<LayoutState, RootState> = {
    navigationComponents: (state) => {
        return state.navigationComponents;
    },
    navigationComponent: (state) => {
        return state.navigationComponent;
    },
    navigationComponentId: (state) : LayoutNavigationIDType => {
        return state.navigationComponent.id as LayoutNavigationIDType;
    },

    sidebarComponent: (state) => {
        return state.sidebarComponent;
    },
    sidebarComponents: (state) => {
        return state.sidebarComponents;
    }
};

export const actions : ActionTree<LayoutState, RootState> = {
    async selectComponent({dispatch, commit, rootGetters, getters}, context : {
        type: 'sidebar' | 'navigation',
        component: LayoutComponent
    }) {
        if(
            context.type === 'navigation' &&
            context.component.hasOwnProperty('id')
        ) {
            context.component = getNavigationComponentById((context.component as any).id);
        }

        const isMatch = context.type === 'sidebar' ?
            isLayoutComponentMatch(getters.sidebarComponent, context.component) :
            isLayoutComponentMatch(getters.navigationComponent, context.component);

        switch (context.type) {
            case 'sidebar':
                commit('setSidebarComponent', context.component);

                await dispatch('update', {type: 'sidebar', component: context.component});

                break;
            case 'navigation':
                commit('setNavigationComponent', context.component);

                await dispatch('update', {type: 'navigation'});

                if(!isMatch) {
                    await dispatch('update', {type: 'sidebar'});
                }
                break;
        }
    },
    async update(
        {dispatch, commit, rootGetters, getters},
        context: {
            type: LayoutComponentType,
            component?: LayoutComponent
        }
    ) {
        switch (context.type) {
            case "navigation":
                commit('setNavigationComponents', {
                    auth: this.$auth,
                    loggedIn: rootGetters["auth/loggedIn"]
                });
                break;
            case "sidebar":
                const component : LayoutComponent = !!context.component ?
                    context.component :
                    {
                        url: (this.$router as any)?.history?.current?.fullPath
                    } as LayoutComponent;

                commit('setSidebarComponents', {
                    component,
                    auth: this.$auth,
                    loggedIn: rootGetters["auth/loggedIn"]
                });
                break;
        }
    }
};

export const mutations : MutationTree<LayoutState> = {
    setInitialized(state, value) {
        state.initialized = value;
    },

    setNavigationComponent (state, component) {
        state.navigationComponent = component;
    },
    setNavigationComponents(state, context) {
        let components = getNavigationComponents();

        components = reduceComponents(components, {
            loggedIn: context.loggedIn,
            auth: context.auth
        });

        state.navigationComponents = components;
    },

    setSidebarComponent(state, component) {
        state.sidebarComponent = isLayoutComponentMatch(state.sidebarComponent, component) ? undefined : component;
    },
    setSidebarComponents (state, context) {
        const navigation = state.navigationComponent ? state.navigationComponent : getNavigationComponentById(LayoutNavigationID.DEFAULT);
        if(navigation !== state.navigationComponent) {
            state.navigationComponent = navigation;
        }

        let components = getSidebarComponentsForNavigationId(navigation.id as LayoutNavigationIDType);

        const isMatch = context.component && isLayoutComponentMatch(state.sidebarComponent, context.component);

        const build = buildComponents(components, {
            component: context.component ?? undefined,
            type: 'sidebar',
            navigationId: state.navigationComponent.id as LayoutNavigationIDType,
            matchShow: isMatch
        });

        components = build.components;

        components = reduceComponents(components, {
            loggedIn: context.loggedIn,
            auth: context.auth
        });

        state.sidebarComponents = components;
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
