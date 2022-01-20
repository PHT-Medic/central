/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import { buildVaultKeyValueURLPath } from './utils';
import {
    VaultKVOptions, VaultKVVersion, VaultKeyValueContext,
} from './type';
import { VaultMountAPI, VaultMountPayload } from '../mount';
import { VaultResourceResponse } from '../type';

export class VaultKeyValueAPI {
    protected client: AxiosInstance;

    protected mount: VaultMountAPI;

    constructor(context: VaultKeyValueContext) {
        this.client = context.client;
        this.mount = context.mountAPI;
    }

    async save(engine: string, key: string, value: Record<string, any>, options?: VaultKVOptions) {
        options ??= {};
        options.version ??= VaultKVVersion.ONE;

        try {
            const response = await this.client.post(buildVaultKeyValueURLPath(options.version, engine, key), value);
            return response.data;
        } catch (e) {
            if (e?.response?.status === 404) {
                await this.createMount({ path: engine });

                return this.save(engine, key, value, options);
            }

            throw e;
        }
    }

    async find<T extends Record<string, any> = Record<string, any>>(
        engine: string,
        key: string,
        options?: VaultKVOptions,
    ) : Promise<VaultResourceResponse<T> | undefined> {
        options ??= {};
        options.version ??= VaultKVVersion.ONE;

        try {
            const { data } = await this.client.get(buildVaultKeyValueURLPath(options.version, engine, key));

            return data;
        } catch (e) {
            if (e.response.status === 404) {
                return undefined;
            }

            throw e;
        }
    }

    async delete(
        engine: string,
        key: string,
        options?: VaultKVOptions,
    ) {
        options ??= {};
        options.version ??= VaultKVVersion.ONE;

        try {
            await this.client.delete(buildVaultKeyValueURLPath(options.version, engine, key));
        } catch (e) {
            if (e.response.status === 404) {
                return;
            }

            throw e;
        }
    }

    async createMount(
        config: Pick<VaultMountPayload, 'path'> & Partial<VaultMountPayload>,
        options?: VaultKVOptions,
    ) {
        return this.mount.create({
            config: {},
            generate_signing_key: true,
            options,
            type: 'kv',
            ...config,
        });
    }
}
