import ApiService, {ApiRequestConfig} from "../index";

class VaultApi extends ApiService {
    constructor() {
        const config : ApiRequestConfig = {
            withCredentials: true,
            timeout: 3000,
            baseURL: 'https://vault.pht.medic.uni-tuebingen.de/v1/',
            token: 's.jmMOV4W43R2zQ2WOuSQMwsV9'
        }

        super(config);

        this.setHeader('X-Vault-Token', config.token);
    }

    //-----------------------------------------------

    public async dropUserPublicKey(userId: number) {
        let response;

        try {
            response = await this.delete(
                'user_pks/'+userId,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Vault-Request': 'true'
                    }
                }
            );

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
     * @param publicKey
     *
     * @throws Error
     */
    public async uploadUserPublicKey(userId: number, publicKey: string) {
        let response;

        try {
            let data = {
                rsa_public_key: publicKey
            };

            let options = {
                cas: 0
            };

            let request = { data, options };

            response = await this.post(
                'user_pks/'+userId,
                request,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Vault-Request': 'true'
                    }
                }
            );

            if(response.status >= 200 && response.status <= 300) {
                return publicKey;
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
