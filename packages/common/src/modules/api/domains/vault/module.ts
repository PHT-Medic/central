/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrapiClient, TrapiClientConfig } from '@trapi/client';

import { APIConnectionStringError, VaultKeyValueAPI } from '../../error';
import {
    APIServiceVaultConfig,
} from './type';
import { VaultMountAPI } from './mount';

export function parseVaultConnectionString(connectionString: string) : APIServiceVaultConfig {
    const parts : string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new APIConnectionStringError('Vault connection string must be in the following format: token@host');
    }

    return {
        host: parts[1],
        token: parts[0],
    };
}

export class VaultAPI extends TrapiClient {
    public readonly mount : VaultMountAPI;

    public readonly keyValue: VaultKeyValueAPI;

    constructor(config: TrapiClientConfig) {
        const vaultConfig: APIServiceVaultConfig = parseVaultConnectionString(config.connectionString);

        config.driver = {
            ...(config.driver ?? {}),
            withCredentials: true,
            timeout: 3000,
            baseURL: vaultConfig.host,
            token: vaultConfig.token,
            headers: {
                'X-Vault-Request': 'true',
                'Content-Type': 'application/json',
            },
        };

        super(config);

        this.setHeader('X-Vault-Token', vaultConfig.token);

        this.mount = new VaultMountAPI(this.driver);
        this.keyValue = new VaultKeyValueAPI({
            client: this.driver,
            mountAPI: this.mount,
        });
    }

    setNamespace(namespace: string) {
        this.setHeader('X-Vault-Namespace', namespace);
    }

    unsetNamespace() {
        this.unsetHeader('X-Vault-Namespace');
    }
}
