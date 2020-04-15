import { AuthStorage } from './../services/authStorage';
import { AuthenticationError, AuthService } from './../services/auth';

const state = () => ({
  authentication: {
    inProgress: false,
    error: null,
    refreshTokenPromise: null
  },
  user: AuthStorage.getUser(),
  permissions: [],

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
  async refreshMe ({ commit, dispatch }) {
    const token = AuthStorage.getToken();
    if (token) {
      try {
        const { user, permissions } = await AuthService.getMe();
        commit('setUser', user);
        commit('setPermissions', permissions);
        return true
      } catch (e) {
        dispatch('logout');
        return false
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
  async login ({ commit }, { name, password }) {
    commit('loginRequest')

    try {
      const token = await AuthService.login(name, password);
      const { user, permissions } = await AuthService.getMe();

      commit('loginSuccess', { user, accessToken: token, permissions });

      return true
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit('loginError', { errorCode: e.errorCode, errorMessage: e.message })
      }

      return false
    }
  },
  /**
     * Try to logout the user.
     * @param commit
     */
  logout ({ commit }) {
    AuthService.logout();
    commit('logoutSuccess')
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
  }
};

const mutations = {
  // Login mutations
  loginRequest (state) {
    state.authentication.inProgress = true;

    state.authentication.error = null
  },
  loginSuccess (state, { user, accessToken, permissions }) {
    state.user = user;
    state.token = accessToken;
    state.permissions = permissions;
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

  // Logout mutations
  logoutSuccess (state) {
    state.user = {};
    state.token = '';
  },

  // --------------------------------------------------------------------

  setUser (state, user) {
    state.user = user;
  },
  setPermissions (state, permissions) {
    state.permissions = permissions;
  },
  setToken (state, token) {
    state.token = token;
  }
};

export {
  state,
  getters,
  actions,
  mutations
}
