import Vue from 'vue';
import {ActionTree, GetterTree, MutationTree} from "vuex";

import {RootState} from "~/store/index";

import { AuthenticationError } from '~/modules/auth'
import {AuthAbstractTokenResponse} from "~/modules/auth/types";

export const AuthStoreKey = {
    user: 'user',
    permissions: 'permissions',
    token: 'token',
    provider: 'provider'
}

export interface AuthState {
    provider: string | undefined,
    user: Record<string, any> | undefined,
    permissions: Record<string, any>[],

    token: AuthAbstractTokenResponse | undefined,
    tokenPromise: Promise<any> | undefined,

    required: boolean,
    inProgress: boolean,
    error: undefined | { code: string, message: string },
}
const state = () : AuthState => ({
        provider: undefined,
        user: undefined,
        permissions: [],

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
    provider: (state: AuthState) => {
        return state.provider;
    },
    permissions: (state: AuthState) => {
        return state.permissions
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

    triggerSetProvider({commit}, provider) {
        this.$authWarehouse.set(AuthStoreKey.provider, provider);

        commit('setProvider', provider);
    },
    triggerUnsetProvider({commit}) {
        this.$authWarehouse.remove(AuthStoreKey.provider);

        commit('unsetProvider');
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
        if (state.token) {
            try {
                const { permissions, ...user } = await this.$auth.getUserInfo();

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
    async triggerLogin ({ commit, dispatch }, credentials: {[key: string] : any}) {
        commit('loginRequest');

        try {
            const token = await this.$auth.attemptAccessTokenWith(credentials);

            commit('loginSuccess');

            dispatch('triggerSetToken', token);

            await dispatch('triggerRefreshMe');
            this.dispatch('layout/update');
        } catch (e) {
            dispatch('triggerUnsetToken');

            if (e instanceof AuthenticationError) {
                commit('loginError', { errorCode: e.errorCode, errorMessage: e.message })
            }

            throw e;
        }
    },

    // --------------------------------------------------------------------

    triggerRefreshToken ({ commit, state, dispatch }) {
        if(
            typeof state.provider === 'undefined' ||
            typeof state.token === 'undefined' ||
            typeof state.token.refreshToken === 'undefined'
        ) {
            throw new Error('It is not possible to receive a new access token');
        }

        if (!state.tokenPromise) {
            commit('loginRequest');

            try {
                const p = this.$auth.attemptRefreshTokenWith(
                    state.token.refreshToken
                );

                commit('setTokenPromise', p);

                p.then(
                    (token) => {
                        commit('setTokenPromise', null);
                        commit('loginSuccess');

                        dispatch('triggerSetToken', token);
                        dispatch('triggerRefreshMe');
                    },
                    () => {
                        commit('setTokenPromise', null)
                    }
                )
            } catch (e) {
                commit('setTokenPromise', null);
                dispatch('triggerAuthError', e.message);

                throw new Error('An error occured on the token refresh request.');
            }
        }

        return state.tokenPromise
    },

    // --------------------------------------------------------------------

    async triggerTokenExpired({dispatch, commit}) {
        try {
            await dispatch('triggerRefreshToken');
        } catch (e) {
            dispatch('triggerSetLoginRequired', true);
        }
    },

    // --------------------------------------------------------------------

    /**
     * Try to logout the user.
     * @param commit
     */
    triggerLogout ({ dispatch, rootState }) {
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

    setProvider(state,provider) {
        state.provider = provider;
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
