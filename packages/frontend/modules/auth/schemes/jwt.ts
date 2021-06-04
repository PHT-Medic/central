import {AuthenticationError} from "../index";
import {useApi} from "~/modules/api";
import {ApiRequestConfig} from "~/modules/api/base";
import {AuthAbstractTokenResponse} from "~/modules/auth/types";
import AbstractAuthScheme from "~/modules/auth/schemes/abstract";

class AuthJWTScheme extends AbstractAuthScheme {
    async attemptToken(data: any): Promise<AuthAbstractTokenResponse> {
        let postData: ApiRequestConfig = {
            method: 'post',
            url: this.options.endpoints.token,
            data: data
        };

        try {
            const response = await useApi(this.options.endpoints.api).request(postData);

            let { token, expiresIn } = response.data;

            let currentTime = new Date();
            let secondsToAdd = parseInt(expiresIn);
            currentTime.setSeconds(currentTime.getSeconds() + secondsToAdd);

            return {
                accessToken: token,
                refreshToken: undefined,
                meta: {
                    expiresIn: expiresIn,
                    expireDate: currentTime.toUTCString()
                }
            };
        } catch (e) {
            const message : string = e.message;
            let status : string = '500';

            if(typeof e.response !== 'undefined' && e.response.status !== 'undefined') {
                status = e.response.status;
            }

            throw new AuthenticationError(status, message);
        }
    }
}

export default AuthJWTScheme;
