/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from 'rapiq';
import { ClientDriverInstance } from 'hapic';
import { RegistryProject } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';
import { nullifyEmptyObjectProperties } from '../../../utils';

export class RegistryProjectAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<RegistryProject>): Promise<CollectionResourceResponse<RegistryProject>> {
        const response = await this.client.get(`registry-projects${buildQuery(options)}`);

        return response.data;
    }

    async getOne(id: RegistryProject['id'], options?: BuildInput<RegistryProject>): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.get(`registry-projects/${id}${buildQuery(options)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.post('registry-projects', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: RegistryProject['id'], data: Record<string, any>): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.post(`registry-projects/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: RegistryProject['id']): Promise<SingleResourceResponse<RegistryProject>> {
        const response = await this.client.delete(`registry-projects/${id}`);

        return response.data;
    }
}
