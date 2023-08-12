/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { Station } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import { nullifyEmptyObjectProperties } from '../../utils';

export class StationAPI extends BaseAPI {
    async getMany(options?: BuildInput<Station>): Promise<CollectionResourceResponse<Station>> {
        const response = await this.client.get(`stations${buildQuery(options)}`);

        return response.data;
    }

    async getOne(id: Station['id'], options?: BuildInput<Station>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.get(`stations/${id}${buildQuery(options)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post('stations', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(id: Station['id'], data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post(`stations/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Station['id']): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.delete(`stations/${id}`);

        return response.data;
    }

    async runCommand(id: Station['id'], task: string, data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post(`stations/${id}/task`, { task, ...data });

        return response.data;
    }
}
