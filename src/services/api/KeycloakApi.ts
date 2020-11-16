import { ApiService, ApiRequestConfig} from "./index";
import env from "../../env";

export type KeycloakAccessToken = {
    accessToken: string,
    expiresIn: number,
    refreshToken: string
}


class KeycloakApi extends ApiService {
    /**
     * Vault Token
     */
    private readonly token: string;

    //-----------------------------------------------

    /**
     * Constructor
     */
    constructor () {
        let config: ApiRequestConfig = {
            baseURL: env.keyCloakApiUrl
        };

        super(config);
    }

    //-----------------------------------------------

    public setToken(accessToken: string) {
        this.setHeader('Authorization','Bearer ' + accessToken);
    }

    public unsetToken(accessToken: string) {
        this.unsetToken('Authorization');
    }

    //-----------------------------------------------

    public async attemptAccessToken(data: Record<string, any>) : Promise<KeycloakAccessToken> {
        let response;

        data.client_id = env.keyCloakClientId;

        const params = new URLSearchParams();
        for(let key in data) {
            params.append(key, data[key]);
        }

        try {
            response = await this.post(
                'protocol/openid-connect/token',
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            let { access_token, expires_in, refresh_token } = response.data;

            return {
                accessToken: access_token,
                expiresIn: expires_in,
                refreshToken: refresh_token
            }
        } catch (e) {
            throw new Error('Die Keycloak Zugangsdaten sind nicht gültig...');
        }
    }
}

export default KeycloakApi;
