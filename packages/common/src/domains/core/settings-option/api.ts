/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { ClientDriverInstance } from 'hapic';
import type { SettingsOption } from './entity';
import { nullifyEmptyObjectProperties } from '../../../utils';
import type { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class SettingsOptionAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(record?: BuildInput<SettingsOption>): Promise<CollectionResourceResponse<SettingsOption>> {
        const response = await this.client.get(`architectures${buildQuery(record)}`);
        return response.data;
    }

    async getOne(id: SettingsOption['id'], requestRecord?: BuildInput<SettingsOption>): Promise<SingleResourceResponse<SettingsOption>> {
        const response = await this.client.get(`architectures/${id}${buildQuery(requestRecord)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<SettingsOption>> {
        const response = await this.client.post('architectures', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: SettingsOption['id']): Promise<SingleResourceResponse<SettingsOption>> {
        const response = await this.client.delete(`architectures/${id}`);
        return response.data;
    }

    async update(id: SettingsOption['id'], data: Record<string, any>): Promise<SingleResourceResponse<SettingsOption>> {
        const response = await this.client.post(`architectures/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }
}
