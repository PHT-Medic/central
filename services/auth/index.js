import ResourceApiService from '../api/resourceApi';
import AuthApiService from "../api/authApi";

import AuthConfig, {AuthModeOauth2, AuthModeToken} from "../../config/auth";

import { AuthStorage } from './storage';
import Oauth2Provider from "./providers/LAP/oauth2Provider";
import TokenProvider from "./providers/LAP/tokenProvider";
import {transformScopeToAbility} from "./helpers/permissionHelper";

// --------------------------------------------------------------------

class AuthenticationError extends Error {
    constructor (errorCode, message) {
        super(message);

        this.name = this.constructor.name;
        this.message = message;
        this.errorCode = errorCode;
    };
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

        console.log('Set authorization header...')

        ResourceApiService.setHeader(key, value);
        AuthApiService.setHeader(key, value)
    },

    /**
     * Unset authorization token header on api requests.
     */
    unsetRequestToken: () => {
        let key = 'Authorization';

        console.log('Unset authorization header...')

        ResourceApiService.unsetHeader(key);
        AuthApiService.unsetHeader(key);
    },

    // --------------------------------------------------------------------

    /**
     * Login with authentication provider.
     *
     * @param credentials
     * @return {Promise<{accessToken: *, refreshToken: *}>}
     */
     async login(credentials) {
        switch(AuthConfig.lapMode) {
            case AuthModeToken:
                let { token, ...tokenData } = await TokenProvider.attemptToken(credentials);

                this.setRequestToken(token);

                return {
                    ...tokenData,
                    token
                }
            case AuthModeOauth2:
                let { accessToken, ...oauthData } = await Oauth2Provider.attemptAccessToken(credentials,'password');

                this.setRequestToken(accessToken);

                return {
                    ...oauthData,
                    accessToken
                }
        }
    },

    // --------------------------------------------------------------------

    async refreshAccessToken() {
        let token = AuthStorage.getToken();

        if(!token) {
            throw new Error('Es existiert kein Refresh Token...');
        }

        if(AuthConfig.lapMode !== AuthModeOauth2) {
            throw new Error('Der Access-Token kann nur in dem Oauth2 Mode genutzt werden.');
        }

        let { refreshToken } = token;

        let { accessToken, ...oauthData } = await  Oauth2Provider.attemptAccessToken({
            refresh_token: refreshToken,
        },'refresh_token');

        this.setRequestToken(accessToken);

        return {
            ...oauthData,
            accessToken
        }
    },

    // --------------------------------------------------------------------

    /**
     * Logout the current user.
     *
     * @returns void
     */
    logout() {
        AuthApiService.unmountInterceptor('auth');
        ResourceApiService.unmountInterceptor('auth');

        this.unsetRequestToken()
    },

    // --------------------------------------------------------------------

    getMe: async () => {
        try {
            const response = await AuthApiService.get(AuthConfig.selfUrl);
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

export default AuthService;

export { AuthenticationError }
