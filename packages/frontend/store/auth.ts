import Vue from 'vue';
import {ActionTree, GetterTree, MutationTree} from "vuex";

import {RootState} from "~/store/index";

import {Oauth2TokenResponse} from "@typescript-auth/core";

export const AuthStoreKey = {
    user: 'user',
    permissions: 'permissions',
    token: 'token',
    provider: 'provider'
}

export type AuthStoreToken = Oauth2TokenResponse & {
    expire_date: string
}

export interface AuthState {
    user: Record<string, any> | undefined,

    permissions: Record<string, any>[],
    permissionsResolved: boolean,

    token: AuthStoreToken | undefined,
    tokenPromise: Promise<any> | undefined,

    required: boolean,
    inProgress: boolean,
    error: undefined | { code: string, message: string },
}
const state = () : AuthState => ({
    user: undefined,

    permissions: [],
    permissionsResolved: false,

    token: undefined,
    tokenPromise: undefined,

    required: false,
    inProgress: false,
    error: undefined
});

export const getters : GetterTree<AuthState, RootState> = {
    user: (state: AuthState) => {
        return state.user
    },
    userId: (state: AuthState) => {
        return state.user ? state.user.id : undefined;
    },
    userRealmId: (state: AuthState) => {
        return state.user ? state.user.realmId : undefined;
    },
    permissions: (state: AuthState) => {
        return state.permissions
    },
    permissionsResolved: (state: AuthState) => {
        return state.permissionsResolved;
    },
    permission: (state: AuthState) => (id: number | string) => {
        let items =  state.permissions.filter((item: Record<string, any>) => {
            if(typeof id === 'number') {
                return item.id === id;
            } else {
                return item.name === id;
            }
        });

        return items.length === 1 ? items[0] : undefined;
    },
    loggedIn: (state : AuthState) => {
        return !!state.token;
    },
    token: (state: AuthState) => {
        return state.token;
    }
};

export const actions : ActionTree<AuthState, RootState> = {
    // --------------------------------------------------------------------

    triggerSetLoginRequired({commit}, required: boolean) {
        commit('setLoginRequired', required);
    },

    // --------------------------------------------------------------------

    triggerSetToken({commit}, token) {
        this.$authWarehouse.set(AuthStoreKey.token, token);

        if(typeof token === 'object' && token.hasOwnProperty('accessToken')) {
            this.$auth.setRequestToken(token.accessToken);
        }

        commit('setToken', token);
    },
    triggerUnsetToken({commit}) {
        this.$authWarehouse.remove(AuthStoreKey.token);
        this.$auth.unsetRequestToken();

        commit('unsetToken');
    },

    // --------------------------------------------------------------------

    triggerSetUser({commit}, user) {
        this.$authWarehouse.set(AuthStoreKey.user, user);
        commit('setUser', user);
    },
    triggerUnsetUser({commit}) {
        this.$authWarehouse.remove(AuthStoreKey.user);
        commit('unsetUser');
    },

    // --------------------------------------------------------------------

    triggerSetPermissions({commit}, permissions) {
        this.$authWarehouse.setLocalStorageItem(AuthStoreKey.permissions, permissions);
        commit('setPermissions', permissions);
    },
    triggerUnsetPermissions({commit}) {
        this.$authWarehouse.removeLocalStorageItem(AuthStoreKey.permissions);
        commit('unsetPermissions');
    },

    // --------------------------------------------------------------------

    /**
     * Try to trigger user refresh.
     *
     * @param state
     * @param dispatch
     *
     * @returns {Promise<boolean>}
     */
    async triggerRefreshMe ({ state, dispatch }) {
        const token = state.token;

        if (token) {
            try {
                const { permissions, ...user } = await this.$auth.getUserInfo(token.access_token);

                dispatch('triggerUnsetUser');

                dispatch('triggerSetUser', user);
                dispatch('triggerSetPermissions', permissions);
            } catch (e) {
                dispatch('triggerLogout');
                throw e;
            }
        }
    },
    // --------------------------------------------------------------------

    /**
     * Try to login the user with given credentials.
     *
     * @return {Promise<boolean>}
     */
    async triggerLogin ({ commit, dispatch }, {name, password}: {name: string, password: string}) {
        commit('loginRequest');

        try {
            const token = await this.$auth.getTokenWithPassword(name, password);

            const extendedToken : AuthStoreToken = {
                ...token,
                expire_date: new Date(Date.now() + token.expires_in * 1000).toString()
            }

            commit('loginSuccess');

            dispatch('triggerSetToken', extendedToken);

            await dispatch('triggerRefreshMe');
            this.dispatch('layout/update');
        } catch (e) {
            dispatch('triggerUnsetToken');

            throw e;
        }
    },

    // --------------------------------------------------------------------

    triggerRefreshToken ({ commit, state, dispatch }) {
        if(
            typeof state.token?.refresh_token !== 'string'
        ) {
            throw new Error('It is not possible to receive a new access token');
        }

        if (!state.tokenPromise) {
            commit('loginRequest');

            try {
                const p = this.$auth.getTokenWithRefreshToken(state.token.refresh_token);

                commit('setTokenPromise', p);

                p.then(
                    (token) => {
                        commit('setTokenPromise', null);
                        commit('loginSuccess');

                        const extendedToken : AuthStoreToken = {
                            ...token,
                            expire_date: new Date(Date.now() + token.expires_in * 1000).toString()
                        }

                        dispatch('triggerSetToken', extendedToken);
                        dispatch('triggerRefreshMe');
                    },
                    () => {
                        commit('setTokenPromise', null)
                    }
                )
            } catch (e) {
                commit('setTokenPromise', null);
                dispatch('triggerAuthError', e.message);

                throw new Error('An error occurred on the token refresh request.');
            }
        }

        return state.tokenPromise
    },

    // --------------------------------------------------------------------

    async triggerTokenExpired({dispatch}) {
        try {
            await dispatch('triggerRefreshToken');
        } catch (e) {
            dispatch('triggerSetLoginRequired', true);

            throw e;
        }
    },

    // --------------------------------------------------------------------

    /**
     * Try to logout the user.
     * @param commit
     */
    triggerLogout ({ dispatch }) {
        dispatch('triggerUnsetToken');
        dispatch('triggerUnsetUser');
        dispatch('triggerUnsetPermissions');

        dispatch('triggerSetLoginRequired', false);

        this.dispatch('layout/update');
    },

    // --------------------------------------------------------------------

    /**
     * Trigger custom authentication error by
     * another service or component.
     *
     * @param commit
     * @param message
     */
    triggerAuthError ({ commit }, message) {
        commit('loginError', { errorCode: 'internal', errorMessage: message })
    },

    //--------------------------------------------------------

    /**
     * Trigger user property change.
     *
     * @param commit
     * @param state
     * @param property
     * @param value
     */
    triggerSetUserProperty ({ commit, state }, {property, value}) {
        commit('setUserProperty', { property, value});
        this.$authWarehouse.remove(AuthStoreKey.user);
        this.$authWarehouse.set(AuthStoreKey.user, state.user);
    }
};

export const mutations : MutationTree<AuthState> = {
    // Login mutations
    loginRequest (state) {
        state.inProgress = true;

        state.error = undefined
    },
    loginSuccess (state) {
        state.inProgress = false;
        state.required = false;
    },
    loginError (state, { errorCode, errorMessage }) {
        state.inProgress = false;

        state.error = {
            code: errorCode,
            message: errorMessage
        }
    },
    setLoginRequired (state, required) {
        state.required = required;
    },

    // --------------------------------------------------------------------

    setTokenPromise (state, promise) {
        state.tokenPromise = promise;
    },

    // --------------------------------------------------------------------

    setUser (state, user) {
        state.user = user;
    },
    unsetUser(state) {
        state.user = undefined;
    },

    // --------------------------------------------------------------------

    setUserProperty(state, {property, value}) {
        if(typeof state.user === 'undefined') return;

        Vue.set(state.user, property, value);
    },

    // --------------------------------------------------------------------

    setPermissions (state, permissions) {
        state.permissions = permissions;
    },
    unsetPermissions(state) {
        state.permissions = [];
    },

    setPermissionsResolved(state, resolved) {
        state.permissionsResolved = !!resolved;
    },

    // --------------------------------------------------------------------
    setToken (state, token) {
        state.token = token;
    },
    unsetToken(state) {
        state.token = undefined;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
