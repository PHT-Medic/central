import ApiService, {ApiRequestConfig} from "../index";
import {APIServiceError} from "./error";

export type VaultConnectionConfig = {
    host: string,
    token: string
}

export function parseVaultConnectionString(connectionString: string) : VaultConnectionConfig {
    const parts : string[] = connectionString.split('@');
    if(parts.length !== 2) {
        throw new APIServiceError('Vault connection string must be in the following format: token@host');
    }

    return {
        host: parts[1],
        token: parts[0]
    }
}

export type VaultEnginePayload = {
    config: Record<string, any>,
    generate_signing_key: boolean,
    options: {
        version: number
    },
    path: string,
    type: string
}

class VaultApi extends ApiService {
    constructor(connectionString: string) {
        const vaultConfig = parseVaultConnectionString(connectionString);

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

    setNamespace(namespace: string) {
        this.setHeader('X-Vault-Namespace', namespace);
    }

    unsetNamespace() {
        this.unsetHeader('X-Vault-Namespace');
    }

    async createKeyValueEngine(config: Pick<VaultEnginePayload, 'path'> & Partial<VaultEnginePayload>) {
        const data : VaultEnginePayload = {
            config: {},
            generate_signing_key: true,
            options: {
                version: 1
            },
            type: 'kv',
            ...config
        };

        const response = await this.post('sys/mounts/'+data.path, data);

        return response.data;
    }
}

let instance : VaultApi | undefined;

export function useVaultApi(connectionString?: string) {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    if(typeof connectionString === 'undefined') {
        throw APIServiceError.connectionStringMissing('vault');
    }

    instance = new VaultApi(connectionString);
    return instance;
}
