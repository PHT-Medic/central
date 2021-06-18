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
