import AuthApiService from "../../../api/authApi";
import {AuthenticationError} from "../../index";
import AuthConfig from "../../../../config/auth";
import AuthStorage from "../../storage";

const TokenProvider = {
    async attemptToken(credentials) {
        let data = {
            method: 'post',
            url: AuthConfig.lap.token.url,
            data: credentials
        };

        try {
            const response = await AuthApiService.customRequest(data);

            let { token, ...meta } = response.data;

            AuthStorage.setToken({
                token
            });

            return {
                ...meta,
                token
            };
        } catch (e) {
            console.log(e);
            throw new AuthenticationError(e.response.status, e.response.data.error.message)
        }
    }
}

export default TokenProvider;
