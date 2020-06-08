import ResourceApiService from '../services/api/resourceApi';
import { AuthService } from '../services/auth';
import { AuthStorage } from "../services/authStorage";
import AuthApiService from "../services/api/authApi";

export default ({ app, env }) => {
    ResourceApiService.init(env.apiUrl);
    AuthApiService.init(env.authApiUrl);

    let token = AuthStorage.getToken();
    if(token) {
        AuthService.setRequestToken(token);
    }

    app.store.dispatch('auth/triggerRefreshMe');
};
