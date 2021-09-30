/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIConfig, APIServiceVaultConfig, APIType} from "../config";
import {BaseAPI} from "../module";
import {ApiRequestConfig} from "../type";
import {APIServiceError} from "./error";

export function parseVaultConnectionString(connectionString: string) : APIServiceVaultConfig {
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

export class VaultAPI extends BaseAPI {
    constructor(config: APIConfig<APIType.VAULT>) {
        const vaultConfig : APIServiceVaultConfig = config.connection ?? parseVaultConnectionString(config.connectionString);

        const driverConfig : ApiRequestConfig = {
            ...(config.driver ?? {}),
            withCredentials: true,
            timeout: 3000,
            baseURL: vaultConfig.host,
            token: vaultConfig.token,
            headers: {
                'X-Vault-Request': 'true',
                'Content-Type': 'application/json'
            }
        }

        super(driverConfig);

        this.setHeader('X-Vault-Token', vaultConfig.token);
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
