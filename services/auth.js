import { ApiService } from './api';
import { AuthStorage } from './authStorage';

class AuthenticationError extends Error {
  constructor (errorCode, message) {
    super(message);

    this.name = this.constructor.name;
    this.message = message;
    this.errorCode = errorCode;
  }
}

const setRequestToken = (token) => {
  ApiService.setHeader('Authorization', 'Bearer ' + token);
};

const unsetRequestToken = () => {
  ApiService.unsetHeader('Authorization');
};

const AuthService = {
  checkRequestToken: () => {
    const token = AuthStorage.getToken();
    if (token) {
      setRequestToken(token)
    }
  },

  /**
     *
     * @param name
     * @param password
     *
     * @returns access_token
     *
     * @throws AuthenticationError
     */
  login: async (name, password) => {
    const data = {
      method: 'post',
      url: 'auth/token', // Todo: set api end point.
      data: {
        name,
        password
      }
    };

    let token;

    try {
      const response = await ApiService.customRequest(data);

      token = response.data.token;
      console.log(token);

      AuthStorage.setToken(token);

      setRequestToken(token)
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.message)
    }

    return token
  },

  /**
     * Logout the current user.
     *
     * @returns void
     */
  logout: () => {
    AuthStorage.dropToken();
    AuthStorage.dropUser();

    unsetRequestToken()
  },

  getMe: async () => {
    const data = {
      method: 'get',
      url: 'auth/me'
    };

    try {
      const response = await ApiService.customRequest(data);
      const user = response.data;

      AuthStorage.setUser(user);
      return user
    } catch (e) {
      throw new AuthenticationError(e.response.status, e.response.data.message)
    }
  }
}

export { AuthService, AuthenticationError }
