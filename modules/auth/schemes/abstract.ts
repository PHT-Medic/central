import {
    AuthAbstractTokenResponse,
    AuthAbstractUserInfoResponse,
    AuthSchemeInterface,
    AuthSchemeOptions
} from "~/modules/auth/types";

import axios from "axios";
import {changeResponseKeyCase} from "~/modules/api/utils";
import api from "~/plugins/api";

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
            let apiUrl : string | undefined = process.env.API_URL;

            if(process.server && typeof process.env.INTERNAL_API_URL !== 'undefined') {
                apiUrl = process.env.INTERNAL_API_URL;
            }

            console.log(apiUrl + this.options.endpoints.userInfo);

            let response = await axios.get(this.options.endpoints.userInfo, {
               baseURL: apiUrl,
               headers: {
                   Authorization: 'Bearer ' + token
               }
            });

            const contentType: string = response.headers['Content-Type'] ?? 'application/json';
            const isJsoN: boolean = contentType.includes('application/json');
            if (isJsoN && response.data) {
                response.data = changeResponseKeyCase(response.data);
            }

            /*
            useApi(this.options.endpoints.api)
                .setAuthorizationBearerHeader(token);

            let response = await useApi(this.options.endpoints.api)
                .get(this.options.endpoints.userInfo);
            */

            return response.data;
        } catch (e) {
            console.log(e);
            throw new Error('Der Endpunkt für Nutzer assozierte Informationen konnte nicht geladen werden.');
        }
    }
}

export default AbstractAuthScheme;
