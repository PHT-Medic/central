import {
    AuthAbstractTokenResponse,
    AuthAbstractUserInfoResponse,
    AuthSchemeInterface,
    AuthSchemeOptions
} from "~/modules/auth/types";

import {AxiosRequestConfig} from "axios";
import {useApi} from "~/modules/api";

/**
 * Basic Auth Provider.
 */
abstract class AbstractAuthScheme implements AuthSchemeInterface {
    protected options: AuthSchemeOptions;

    //--------------------------------------------------------------------

    constructor(config: AuthSchemeOptions) {
        this.options = config;
    }

    //--------------------------------------------------------------------

    public setOptions(config: AuthSchemeOptions) {
        this.options = config;
    }

    public getOptions(): AuthSchemeOptions {
        return this.options;
    }

    //--------------------------------------------------------------------

    abstract attemptToken(data: any): Promise<AuthAbstractTokenResponse>;

    //--------------------------------------------------------------------

    async getUserInfo(token: string): Promise<AuthAbstractUserInfoResponse> {
        try {
            let requestConfig : AxiosRequestConfig = {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }

            if(process.server && typeof process.env.INTERNAL_API_URL !== 'undefined') {
                requestConfig.baseURL = process.env.INTERNAL_API_URL;
            }

            let response = await useApi(this.options.endpoints.api)
                .get(this.options.endpoints.userInfo, requestConfig);

            return response.data;
        } catch (e) {
            console.log(e);
            throw new Error('Der Endpunkt für Nutzer assozierte Informationen konnte nicht geladen werden.');
        }
    }
}

export default AbstractAuthScheme;
