import Vue from 'vue';
import Vuex from 'vuex';

import {AuthStorage} from "./AuthStorage";
import {AuthenticationError, AuthService} from "./AuthService";
import router from "../router/RouterService";

Vue.use(Vuex);

const state = {
    authentication: {
        inProgress: false,
        error: null,
        refreshTokenPromise: null
    },
    user: AuthStorage.getUser(),
    token: AuthStorage.getToken()
};

const getters = {
    loggedIn: (state) => {
        return !!state.token
    },
    user: (state) => {
        return state.user;
    },

    authenticating: (state) => {
        return state.authentication.inProgress
    },
    authenticationErrorCode: (state) => {
        return state.authentication.error ? state.authentication.error.code : '';
    },
    authenticationErrorMessage: (state) => {
        return state.authentication.error ? state.authentication.error.message : '';
    },
};

const actions = {
    async refreshMe({commit,dispatch}) {
        let token = AuthStorage.getToken();
        if(token) {
            try {
                let user = await AuthService.getMe();
                commit('setUser', user);
                return true;
            } catch (e) {
                dispatch('logout');
                return false;
            }
        }
    },
    /**
     * Try to login the user with given credentials.
     *
     * @param commit
     * @param name
     * @param password
     *
     * @return {Promise<boolean>}
     */
    async login({ commit }, {name, password}) {
        commit('loginRequest');

        try {
            const token = await AuthService.login(name, password);
            const user = await AuthService.getMe();

            console.log(token);

            commit('loginSuccess', {user: user, accessToken: token});

            console.log(token);

            await router.push(router.history.current.query.redirect || '/dashboard');

            return true;
        } catch (e) {
            if (e instanceof AuthenticationError) {
                commit('loginError', {errorCode: e.errorCode, errorMessage: e.message})
            }

            return false;
        }
    },
    /**
     * Try to logout the user.
     * @param commit
     */
    logout({ commit }) {
        AuthService.logout();
        commit('logoutSuccess');

        router.push('/login');
    },

    /**
     * Trigger custom authentication error by
     * another service or component.
     *
     * @param commit
     * @param message
     */
    triggerAuthError({ commit }, message) {
        commit('loginError', {errorCode: 'internal', errorMessage: message});
    }
};

const mutations = {
    //Login mutations
    loginRequest(state) {
        state.authentication.inProgress = true;

        state.authentication.error = null;
    },
    loginSuccess(state, {user, accessToken}) {
        state.user = user;
        state.token = accessToken;
        state.authentication.inProgress = false;
    },
    loginError(state, {errorCode, errorMessage}) {
        state.authentication.inProgress = false;

        state.authentication.error = {
            code: errorCode,
            message: errorMessage
        };
    },

    //Logout mutations
    logoutSuccess(state) {
        state.user = {};
        state.token = '';
    },

    setUser(state, user) {
        state.user = user;
    },
    setToken(state, token) {
        state.token = token;
    }
};

export const auth = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};