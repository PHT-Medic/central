import AuthConfig from "../../../../config/auth";
import AuthApiService from "../../../api/authApi";
import Oauth2Provider from "../LAP/oauth2Provider";
import TokenProvider from "../LAP/tokenProvider";

const LdapProvider = {
    async attempt(credentials) {
        let data = {
            method: 'post',
            url: AuthConfig.tpap.ldap.url,
            data: credentials
        };

        let response = await AuthApiService.customRequest(data);
        let responseData = response.data;

        switch (AuthConfig.lapMode) {
            case Oauth2Provider:
                let {access_token, refresh_token } = responseData;

                return {
                    accessToken: access_token,
                    refreshToken: refresh_token
                }
            case TokenProvider:
                let { token } = responseData;

                return {
                    token
                }
        }
    }
}

export default LdapProvider;
