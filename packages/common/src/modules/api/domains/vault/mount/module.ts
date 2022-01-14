/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import { VaultMountPayload } from './type';

export class VaultMountAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async create(data: VaultMountPayload) {
        const response = await this.client.post(`sys/mounts/${data.path}`, data);

        return response.data;
    }

    async delete(data: VaultMountPayload | string) {
        const path : string = typeof data === 'string' ?
            data :
            data.path;

        try {
            await this.client.delete(`sys/mounts/${path}`);
        } catch (e) {
            if (e.response.status === 404) {
                return;
            }

            throw e;
        }
    }
}
