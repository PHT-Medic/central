import { AuthStorage } from '../services/authStorage';
import AuthService, { AuthenticationError } from '../services/auth';

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
    loggedIn: (state) => {
        return !!state.token
    },
    user: (state) => {
        return state.user
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
                dispatch('logout');
                return false
            }
        }
    },

    //--------------------------------------------------------

    /**
     * Try to login the user with given credentials.
     *
     * @param commit
     * @param name
     * @param password
     *
     * @return {Promise<boolean>}
     */
    async triggerLogin ({ commit }, { name, password }) {
        commit('loginRequest')

        try {
            const token = await AuthService.login(name, password);
            console.log(token);

            const { user, permissions } = await AuthService.getMe();

            let abilities = AuthService.transformPermissionsToAbilities(permissions);

            commit('loginSuccess');

            commit('setToken', token);
            commit('setUser', user);
            commit('setPermissions', permissions);
            commit('setAbilities', abilities);

            return true
        } catch (e) {
            if (e instanceof AuthenticationError) {
                commit('loginError', { errorCode: e.errorCode, errorMessage: e.message })
            }

            return false
        }
    },
    /**
     * Try to trigger user logout.
     *
     * @param commit
     */
    triggerLogout ({ commit }) {
        AuthService.logout();

        commit('unsetToken');
        commit('unsetUser');
        commit('unsetPermissions');
        commit('unsetAbilities');
    },

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
        this.state.permissions = [];

        AuthStorage.dropPermissions();
    },

    setAbilities(state, abilities) {
        state.abilities = abilities;

        AuthStorage.setAbilities(abilities);
    },
    unsetAbilities(state) {
        this.state.abilities = [];

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
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
