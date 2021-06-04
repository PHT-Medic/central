import  {AuthenticationError} from "../index";
import {useApi} from "~/modules/api";
import {ApiRequestConfig} from "~/modules/api/base";
import {AuthAbstractTokenResponse, AuthSchemeOauth2OptionsInterface} from "~/modules/auth/types";
import AbstractAuthScheme from "~/modules/auth/schemes/abstract";

class Oauth2Scheme extends AbstractAuthScheme {
    public async attemptToken(data: any): Promise<AuthAbstractTokenResponse> {
        let requestData: ApiRequestConfig = {
            method: 'post',
            url: this.options.endpoints.token,
            data: {
                ...data,
                client_id: (<AuthSchemeOauth2OptionsInterface> this.options).clientId,
                client_secret: (<AuthSchemeOauth2OptionsInterface> this.options).clientSecret
            }
        };

        try {
            const response = await useApi(this.options.endpoints.api).request(requestData);
            let { access_token, refresh_token, expires_in } = response.data.data;

            let currentTime = new Date();
            let secondsToAdd = parseInt(expires_in);
            currentTime.setSeconds(currentTime.getSeconds() + secondsToAdd);

            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                meta: {
                    expiresIn: expires_in,
                    expireDate: currentTime.toUTCString(),
                }
            };
        } catch (e) {
            if (typeof e.response !== 'undefined' && e.response.hasOwnProperty('data')) {
                throw new AuthenticationError(
                    e.response.status,
                    e.response.data.error.message
                );
            }

            console.log(e);

            throw new AuthenticationError(
                '500',
                'Es ist ein Fehler bei der Verbindung mit dem Authentifzierungs-Server aufgetreten.'
            );
        }
    }
}

export default Oauth2Scheme;
