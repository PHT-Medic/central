/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue from 'vue';
import type { ActionTree, GetterTree, MutationTree } from 'vuex';

import type {
    AbilityDescriptor,
    OAuth2TokenGrantResponse, Realm,
    User,
} from '@authup/common';
import {
    OAuth2TokenKind,
} from '@authup/common';
import type { RootState } from './index';
import { AuthBrowserStorageKey } from '../config/auth';

export interface AuthState {
    user: User | undefined,

    realmId: string | undefined,
    realmName: string | undefined
    managementRealmId: string | undefined,
    managementRealmName: string | undefined,

    permissions: AbilityDescriptor[],
    resolved: boolean,

    accessToken: string | undefined,
    accessTokenExpireDate: Date | undefined,
    refreshToken: string | undefined,

    tokenPromise: Promise<any> | undefined,

    required: boolean,
    inProgress: boolean,
    error: undefined | { code: string, message: string },
}
const state = () : AuthState => ({
    user: undefined,

    realmId: undefined,
    realmName: undefined,

    managementRealmId: undefined,
    managementRealmName: undefined,

    permissions: [],
    resolved: false,

    accessToken: undefined,
    accessTokenExpireDate: undefined,
    refreshToken: undefined,

    tokenPromise: undefined,

    required: false,
    inProgress: false,
    error: undefined,
});

export const getters : GetterTree<AuthState, RootState> = {
    user: (state: AuthState) => state.user,
    userId: (state: AuthState) => (state.user ? state.user.id : undefined),

    realmId: (state: AuthState) => state.realmId,
    realmName: (state: AuthState) => state.realmName,

    managementRealmId: (state) => state.managementRealmId || state.realmId,
    managementRealmName: (state) => state.managementRealmName || state.realmName,

    permissions: (state: AuthState) => state.permissions,
    resolved: (state: AuthState) => state.resolved,
    permission: (state: AuthState) => (id: number | string) => {
        const items = state.permissions.filter((item: Record<string, any>) => {
            if (typeof id === 'number') {
                return item.id === id;
            }
            return item.name === id;
        });

        return items.length === 1 ? items[0] : undefined;
    },
    loggedIn: (state : AuthState) => !!state.accessToken,

    accessToken: (state: AuthState) => state.accessToken,
    accessTokenExpireDate: (state: AuthState) => state.accessTokenExpireDate,
    refreshToken: (state: AuthState) => state.refreshToken,
};

export const actions : ActionTree<AuthState, RootState> = {
    // --------------------------------------------------------------------

    triggerSetLoginRequired({ commit }, required: boolean) {
        commit('setLoginRequired', required);
    },

    // --------------------------------------------------------------------

    triggerSetToken({ commit }, { kind, token }) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                this.$authWarehouse.set(AuthBrowserStorageKey.ACCESS_TOKEN, token);
                this.$auth.setRequestToken(token);
                break;
            case OAuth2TokenKind.REFRESH:
                this.$authWarehouse.set(AuthBrowserStorageKey.REFRESH_TOKEN, token);
                break;
        }

        commit('setToken', { kind, token });
    },
    triggerSetTokenExpireDate({ commit }, { kind, date }) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                this.$authWarehouse.set(AuthBrowserStorageKey.ACCESS_TOKEN_EXPIRE_DATE, date);
                break;
        }

        commit('setTokenExpireDate', { kind, date });
    },
    triggerUnsetToken({ commit }, kind) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                this.$authWarehouse.remove(AuthBrowserStorageKey.ACCESS_TOKEN);
                this.$authWarehouse.remove(AuthBrowserStorageKey.ACCESS_TOKEN_EXPIRE_DATE);
                this.$auth.unsetRequestToken();
                break;
            case OAuth2TokenKind.REFRESH:
                this.$authWarehouse.remove(AuthBrowserStorageKey.REFRESH_TOKEN);
                break;
        }

        commit('unsetToken', kind);
    },

    // --------------------------------------------------------------------

    triggerSetUser({ commit }, entity) {
        this.$authWarehouse.set(AuthBrowserStorageKey.USER, entity);
        commit('setUser', entity);
    },
    triggerUnsetUser({ commit }) {
        this.$authWarehouse.remove(AuthBrowserStorageKey.USER);
        commit('unsetUser');
    },

    // --------------------------------------------------------------------

    triggerSetRealm({ commit }, realm: Partial<Realm>) {
        commit('setRealm', realm);

        this.$authWarehouse.set(AuthBrowserStorageKey.REALM, realm);
    },

    triggerSetManagementRealm({ commit }, realm: Partial<Realm>) {
        commit('setManagementRealm', realm);

        this.$authWarehouse.set(AuthBrowserStorageKey.MANAGEMENT_REALM, realm);
    },

    // --------------------------------------------------------------------

    triggerSetPermissions({ commit }, permissions) {
        this.$authWarehouse.setLocalStorageItem(AuthBrowserStorageKey.PERMISSIONS, permissions);
        commit('setPermissions', permissions);
    },
    triggerUnsetPermissions({ commit }) {
        this.$authWarehouse.removeLocalStorageItem(AuthBrowserStorageKey.PERMISSIONS);
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
    async triggerRefreshMe({ state, dispatch }) {
        const { accessToken } = state;

        if (accessToken) {
            const entity = await this.$auth.client.userInfo.get(accessToken);
            dispatch('triggerSetUser', entity);

            const token = await this.$auth.client.token.introspect(accessToken);
            dispatch('triggerSetPermissions', token.permissions);
            dispatch('triggerSetRealm', {
                id: token.realm_id,
                name: token.realm_name,
            });
        }
    },
    // --------------------------------------------------------------------

    /**
     * Try to log in the user with given credentials.
     *
     * @return {Promise<boolean>}
     */
    async triggerLogin({ commit, dispatch }, { name, password }: {name: string, password: string}) {
        commit('loginAttempt');

        try {
            const token = await this.$auth.getTokenWithPassword(name, password);

            commit('loginSuccess');

            dispatch('triggerSetTokenExpireDate', { kind: OAuth2TokenKind.ACCESS, date: new Date(Date.now() + token.expires_in * 1000) });

            dispatch('triggerSetToken', { kind: OAuth2TokenKind.ACCESS, token: token.access_token });
            dispatch('triggerSetToken', { kind: OAuth2TokenKind.REFRESH, token: token.refresh_token });

            await dispatch('triggerRefreshMe');
        } catch (e) {
            await dispatch('triggerUnsetToken', OAuth2TokenKind.ACCESS);
            await dispatch('triggerUnsetToken', OAuth2TokenKind.REFRESH);

            throw e;
        }
    },

    // --------------------------------------------------------------------

    triggerRefreshToken({ commit, state }) : Promise<OAuth2TokenGrantResponse> {
        if (!state.refreshToken) {
            return Promise.reject(new Error('It is not possible to receive a new access token'));
        }

        if (!state.tokenPromise) {
            commit('loginAttempt');

            const tokenPromise = this.$auth.getTokenWithRefreshToken(state.refreshToken);
            tokenPromise.then((r) => {
                commit('loginSuccess');
                return r;
            });
            tokenPromise.catch((e) => {
                commit('loginError', e);
                commit('setTokenPromise', null);
                throw e;
            });

            commit('setTokenPromise', tokenPromise);

            return tokenPromise;
        }

        return state.tokenPromise;
    },

    // --------------------------------------------------------------------

    /**
     * Try to log out the user.
     *
     * @param dispatch
     */
    async triggerLogout({ dispatch }) {
        await dispatch('triggerUnsetToken', OAuth2TokenKind.ACCESS);
        await dispatch('triggerUnsetToken', OAuth2TokenKind.REFRESH);
        await dispatch('triggerUnsetUser');
        await dispatch('triggerUnsetPermissions');

        await dispatch('triggerSetLoginRequired', false);

        await dispatch('triggerSetRealm', {});
        await dispatch('triggerSetManagementRealm', {});
    },

    // --------------------------------------------------------------------

    /**
     * Trigger custom authentication error by
     * another service or component.
     *
     * @param commit
     * @param message
     */
    triggerAuthError({ commit }, message) {
        commit('loginError', { errorCode: 'internal', errorMessage: message });
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
    triggerSetUserProperty({ commit, state }, { property, value }) {
        commit('setUserProperty', { property, value });
        this.$authWarehouse.remove(AuthBrowserStorageKey.USER);
        this.$authWarehouse.set(AuthBrowserStorageKey.USER, state.user);
    },
};

export const mutations : MutationTree<AuthState> = {
    // Login mutations
    loginAttempt(state) {
        state.inProgress = true;

        state.error = undefined;
    },
    loginSuccess(state) {
        state.inProgress = false;
        state.required = false;
    },
    loginError(state, { errorCode, errorMessage }) {
        state.inProgress = false;

        state.error = {
            code: errorCode,
            message: errorMessage,
        };
    },
    setLoginRequired(state, required) {
        state.required = required;
    },

    // --------------------------------------------------------------------

    setTokenPromise(state, promise) {
        state.tokenPromise = promise;
    },

    // --------------------------------------------------------------------

    setUser(state, user) {
        state.user = user;
    },
    unsetUser(state) {
        state.user = undefined;
    },

    // --------------------------------------------------------------------

    setRealm(state, { id, name }) {
        state.realmId = id;
        state.realmName = name;
    },

    setManagementRealm(state, { id, name }) {
        state.managementRealmId = id;
        state.managementRealmName = name;
    },

    // --------------------------------------------------------------------

    setUserProperty(state, { property, value }) {
        if (typeof state.user === 'undefined') return;

        Vue.set(state.user, property, value);
    },

    // --------------------------------------------------------------------

    setPermissions(state, permissions) {
        state.permissions = permissions;
    },
    unsetPermissions(state) {
        state.permissions = [];
    },

    // --------------------------------------------------------------------

    setResolved(state, resolved) {
        state.resolved = !!resolved;
    },

    // --------------------------------------------------------------------

    setToken(state, { kind, token }) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                state.accessToken = token;
                break;
            case OAuth2TokenKind.REFRESH:
                state.refreshToken = token;
                break;
        }
    },
    unsetToken(state, kind) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                state.accessToken = undefined;
                break;
            case OAuth2TokenKind.REFRESH:
                state.refreshToken = undefined;
                break;
        }
    },
    setTokenExpireDate(state, { kind, date }) {
        switch (kind) {
            case OAuth2TokenKind.ACCESS:
                state.accessTokenExpireDate = date;
                break;
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
