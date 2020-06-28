import Vue from 'vue';
import Gravatar from 'vue-gravatar';

Vue.component('v-gravatar',Gravatar);

//----------------------------------------------------------

import ResourceApiService from '../services/api/resourceApi';
import AuthService from '../services/auth';
import AuthStorage from "../services/auth/storage";
import AuthApiService from "../services/api/authApi";

import AppConfig from "../config/app";
import AuthConfig, { AuthModeToken, AuthModeOauth2 } from "../config/auth";

export default ({ app, env }) => {
    let apiUrl = typeof env.resourceApiUrl === 'string' ? env.resourceApiUrl : AppConfig.apiUrl;
    let authApiUrl = typeof env.authApiUrl === 'string' ? env.authApiUrl : AuthConfig.baseUrl;

    ResourceApiService.init(apiUrl);
    AuthApiService.init(authApiUrl);

    try {
        let token = AuthStorage.getToken();
        if (token) {
            ResourceApiService.mountInterceptor('auth');
            AuthApiService.mountInterceptor('auth');

            switch (AuthConfig.lapMode) {
                case AuthModeToken:
                    AuthService.setRequestToken(token.token);
                    break;
                case AuthModeOauth2:
                    AuthService.setRequestToken(token.accessToken);
                    break;
            }
        }
    } catch (e) {

    }
};
