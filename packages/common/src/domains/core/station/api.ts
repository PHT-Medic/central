/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { AxiosInstance } from 'axios';
import { Station } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class StationAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<Station>): Promise<CollectionResourceResponse<Station>> {
        const response = await this.client.get(`stations${buildQuery(options)}`);

        return response.data;
    }

    async getOne(id: number): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.get(`stations/${id}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post('stations', data);

        return response.data;
    }

    async update(id: number, data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post(`stations/${id}`, data);

        return response.data;
    }

    async delete(id: number): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.delete(`stations/${id}`);

        return response.data;
    }

    async runCommand(id: number, task: string, data: Record<string, any>): Promise<SingleResourceResponse<Station>> {
        const response = await this.client.post(`stations/${id}/task`, { task, ...data });

        return response.data;
    }
}
