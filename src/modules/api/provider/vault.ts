import ApiService, {ApiRequestConfig} from "../index";

class VaultApi extends ApiService {
    constructor() {
        const config : ApiRequestConfig = {
            withCredentials: true,
            timeout: 3000,
            baseURL: 'https://vault.pht.medic.uni-tuebingen.de/v1/',
            token: 's.jmMOV4W43R2zQ2WOuSQMwsV9',
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
