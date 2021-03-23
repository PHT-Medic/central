import {
    AuthAbstractTokenResponse,
    AuthAbstractUserInfoResponse,
    AuthSchemeInterface,
    AuthSchemeOptions
} from "~/modules/auth/types";

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
            useApi(this.options.endpoints.api).setAuthorizationBearerHeader(token);
            let response = await useApi(this.options.endpoints.api).get(this.options.endpoints.userInfo);

            return response.data;
        } catch (e) {
            throw new Error('Der Endpunkt für Nutzer assozierte Informationen konnte nicht geladen werden.');
        }
    }
}

export default AbstractAuthScheme;
