import ResourceApiService from "../../../api/resourceApi";
import {AuthStorage} from "../../storage";
import AuthService, {AuthenticationError} from "../../index";
import AuthConfig from "../../../../config/auth";

const Oauth2Provider = {
    async attemptAccessToken(credentials, grantType) {
        let data = {
            method: 'post',
            url: AuthConfig.lap.oauth2.url,
            data: {
                ...credentials,
                grant_type: grantType,
                client_id: AuthConfig.lap.oauth2.clientId,
                client_secret: AuthConfig.lap.oauth2.clientSecret
            }
        };

        try {
            const response = await ResourceApiService.customRequest(data);
            // Todo: only valid for json-api response
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;

            AuthStorage.setToken({
                accessToken,
                refreshToken
            });

            return {
                accessToken,
                refreshToken
            };
        } catch (e) {
            throw new AuthenticationError(e.response.status, e.response.data.error.message);
        }
    }
}

export default Oauth2Provider;
