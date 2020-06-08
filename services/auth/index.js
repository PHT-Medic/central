import AuthApiService from "../api/authApi";
import ResourceApiService from "../api/resourceApi";
import { transformScopeToAbility } from "./helpers/permissionHelper";

// --------------------------------------------------------------------

class AuthenticationError extends Error {
  constructor (errorCode, message) {
    super(message);

    this.name = this.constructor.name;
    this.message = message;
    this.errorCode = errorCode;
  }
}

// --------------------------------------------------------------------

const AuthService = {
    /**
     * Set authorization token header on api requests.
     * @param token
     */
    setRequestToken: (token) => {
        let key = 'Authorization';
        let value = 'Bearer ' + token;
        ResourceApiService.setHeader(key, value);
        AuthApiService.setHeader(key, value)
    },

    /**
     * Unset authorization token header on api requests.
     */
    unsetRequestToken: () => {
        let key = 'Authorization';
        ResourceApiService.unsetHeader(key);
        AuthApiService.unsetHeader(key);
    },

    // --------------------------------------------------------------------

  /**
     *
     * @param name
     * @param password
     *
     * @returns access_token
     *
     * @throws AuthenticationError
     */
    async login(name, password) {
        const data = {
            method: 'post',
            url: 'token',
            data: {
                name,
                password
            }
        };

        let token;

        try {
            const response = await AuthApiService.customRequest(data);

            token = response.data.token;

            this.setRequestToken(token)
        } catch (e) {
             throw new AuthenticationError(e.response.status, e.response.data.error.message)
        }

        return token
    },

    // --------------------------------------------------------------------

    /**
     * Logout the current user.
     *
     * @returns void
     */
    logout() {
        this.unsetRequestToken();
    },

    // --------------------------------------------------------------------

    /**
     * Get the current user.
     *
     * @throws Error
     * @returns {Promise<{permissions, user}>}
     */
    getMe: async () => {
        try {
            const response = await AuthApiService.get('me');
            const { user, permissions } = response.data;

            return {
                user,
                permissions
            };
        } catch (e) {
            throw new Error('Die Sitzung ist ausgelaufen.');
        }
    },

    // --------------------------------------------------------------------

    transformPermissionsToAbilities(permissions) {
        let abilities = [];

        for(let i=0; i<permissions.length; i++) {
            let { name, scope } = permissions[i];

            let ability = transformScopeToAbility(name, scope);
            abilities.push(ability);
        }

        return abilities;
    }
};

export { AuthService, AuthenticationError }
export default AuthService;
