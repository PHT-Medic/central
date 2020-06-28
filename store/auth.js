import { AuthStorage } from '../services/auth/storage'
import AuthService, { AuthenticationError } from './../services/auth'
import AuthApiService from "../services/api/authApi";
import ResourceApiService from "../services/api/resourceApi";
import AuthConfig, {AuthModeOauth2} from "../config/auth";

const state = () => ({
    authentication: {
        inProgress: false,
        error: null,
        refreshTokenPromise: null
    },
    user: AuthStorage.getUser(),

    permissions: AuthStorage.getPermissions(),
    abilities: AuthStorage.getAbilities(),

    token: AuthStorage.getToken()
});

const getters = {
    user: (state) => {
        return state.user
    },
    permissions: (state) => {
        return state.permissions
    },

    loggedIn: (state) => {
        return !!state.token
    },

    authenticating: (state) => {
        return state.authentication.inProgress
    },
    authenticationErrorCode: (state) => {
        return state.authentication.error ? state.authentication.error.code : ''
    },
    authenticationErrorMessage: (state) => {
        return state.authentication.error ? state.authentication.error.message : ''
    }
};

const actions = {
    /**
     * Try to trigger user logout.
     *
     * @param commit
     * @param dispatch
     * @returns {Promise<boolean>}
     */
    async triggerRefreshMe ({ commit, dispatch }) {
        const token = AuthStorage.getToken();
        if (token) {
            try {
                const { user, permissions } = await AuthService.getMe();

                commit('setUser', user);
                commit('setPermissions', permissions);

                const abilities = await AuthService.transformPermissionsToAbilities(permissions);

                commit('setAbilities', abilities);
                return true
            } catch (e) {
                dispatch('triggerLogout');
                return false
            }
        }
    },
    // --------------------------------------------------------------------

    /**
     * Try to login the user with given credentials.
     *
     * @param commit
     * @param dispatch
     *
     * @param data
     * @param provider
     *
     * @return {Promise<boolean>}
     */
    async triggerLogin ({ commit, dispatch }, { data, provider}) {
        commit('loginRequest');

        try {
            const token = await AuthService.login(data, provider);

            commit('loginSuccess');
            commit('setToken', token);

            AuthApiService.mountInterceptor('auth');
            ResourceApiService.mountInterceptor('auth');

            dispatch('triggerRefreshMe');
        } catch (e) {
            if (e instanceof AuthenticationError) {
                commit('loginError', { errorCode: e.errorCode, errorMessage: e.message })
            }

            throw new Error(e.message);
        }
    },

    // --------------------------------------------------------------------

    triggerRefreshToken ({ commit, state, dispatch }) {
        if (!state.refreshTokenPromise) {
            if(AuthConfig.lapMode !== AuthModeOauth2) {
                throw new Error('Der Refresh Token kann nicht in diesem LAP Mode erstellt werden...');
            }

            try {
                const p = AuthService.refreshAccessToken();
                commit('setRefreshTokenPromise', p);

                p.then(
                    (token) => {
                        commit('setRefreshTokenPromise', null);

                        commit('loginSuccess');
                        commit('setToken',token);
                        dispatch('triggerRefreshMe');
                    },
                    () => {
                        commit('refreshTokenPromise', null)
                    }
                )
            } catch (e) {
                commit('setRefreshTokenPromise', null);
                dispatch('triggerAuthError', e.message);
            }
        }

        return state.refreshTokenPromise
    },

    // --------------------------------------------------------------------

    /**
     * Try to logout the user.
     * @param commit
     */
    triggerLogout ({ commit }) {
        AuthService.logout();

        AuthApiService.unmountInterceptor('auth');
        ResourceApiService.unmountInterceptor('auth');

        commit('unsetToken');
        commit('unsetUser');
        commit('unsetPermissions');
        commit('unsetAbilities');
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
    triggerSetUserProperty ({ commit }, {property, value}) {
        commit('setUserProperty', { property, value });
    }
};

const mutations = {
    // Login mutations
    loginRequest (state) {
        state.authentication.inProgress = true;

        state.authentication.error = null
    },
    loginSuccess (state) {
        state.authentication.inProgress = false;
    },
    loginError (state, { errorCode, errorMessage }) {
        state.authentication.inProgress = false;

        state.authentication.error = {
            code: errorCode,
            message: errorMessage
        }
    },

    // --------------------------------------------------------------------

    setRefreshTokenPromise (state, promise) {
        state.refreshTokenPromise = promise;
    },

    // --------------------------------------------------------------------

    setUser (state, user) {
        state.user = user;

        AuthStorage.setUser(state.user);
    },
    unsetUser(state) {
        state.user = null;

        AuthStorage.dropUser();
    },

    // --------------------------------------------------------------------

    setUserProperty(state, {property, value}) {
        state.user[property] = value;

        AuthStorage.setUser(state.user);
    },

    // --------------------------------------------------------------------

    setPermissions (state, permissions, abilities) {
        state.permissions = permissions;

        AuthStorage.setPermissions(permissions);
    },
    unsetPermissions(state) {
        state.permissions = [];

        AuthStorage.dropPermissions();
    },

    setAbilities(state, abilities) {
        state.abilities = abilities;

        AuthStorage.setAbilities(abilities);
    },
    unsetAbilities(state) {
        state.abilities = [];

        AuthStorage.dropAbilities();
    },

    // --------------------------------------------------------------------
    setToken (state, token) {
        state.token = token;

        AuthStorage.setToken(token);
    },
    unsetToken(state) {
        state.token = null;

        AuthStorage.dropToken();
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
