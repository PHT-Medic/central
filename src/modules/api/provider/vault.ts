import ApiService, {ApiRequestConfig} from "../index";
import env from "../../../env";

export type VaultConnectionConfig = {
    host: string,
    token: string
}

export function parseVaultConnectionString(connectionString: string) : VaultConnectionConfig {
    const parts : string[] = connectionString.split('@');
    if(parts.length !== 2) {
        throw new Error('Vault connection string must be in the following format: token@host');
    }

    return {
        host: parts[1],
        token: parts[0]
    }
}

class VaultApi extends ApiService {
    constructor() {
        const vaultConfig = parseVaultConnectionString(env.vaultConnectionString);

        const config : ApiRequestConfig = {
            withCredentials: true,
            timeout: 3000,
            baseURL: vaultConfig.host,
            token: vaultConfig.token,
            headers: {
                'X-Vault-Request': 'true',
                'Content-Type': 'application/json'
            }
        }

        super(config);

        this.setHeader('X-Vault-Token', config.token);
    }

    //-----------------------------------------------

    public async dropUserPublicKey(userId: number) {
        let response;

        try {
            response = await this.delete('user_pks/'+userId);

            if(response.status >= 200 && response.status <= 300) {
                return;
            }
        } catch (e) {
            throw new Error('PublicKey Repository rejected deletion of public key.');
        }
    }

    //-----------------------------------------------

    /**
     *
     * @param userId
     * @param keyRing
     *
     * @throws Error
     */
    public async uploadUserPublicKey(userId: number, keyRing: { publicKey: string, heKey: string }) {
        let response;

        try {
            const data : Record<string, any> = {
                rsa_public_key: keyRing.publicKey,
                he_key: keyRing.heKey
            };

            const options : Record<string, any>  = {
                cas: 0
            };

            let request = { data, options };

            response = await this.post(
                'user_pks/'+userId,
                request,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if(response.status >= 200 && response.status <= 300) {
                return;
            }
        } catch(e) {
            throw Error('Unable to upload public key');
        }

        throw Error('PublicKey Repository rejected upload of public key.');
    }
}

let instance : VaultApi | undefined;

export function useVaultApi() {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    instance = new VaultApi();
    return instance;
}
