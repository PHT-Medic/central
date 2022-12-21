/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from 'hapic';
import { BuildInput, buildQuery } from 'rapiq';
import { TrainLog } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainLogAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<TrainLog>): Promise<CollectionResourceResponse<TrainLog>> {
        const { data: response } = await this.client.get(`train-logs${buildQuery(options)}`);
        return response;
    }

    async getOne(id: TrainLog['id']): Promise<SingleResourceResponse<TrainLog>> {
        const { data: response } = await this.client.get(`train-logs/${id}`);

        return response;
    }

    async delete(id: TrainLog['id']): Promise<SingleResourceResponse<TrainLog>> {
        const { data: response } = await this.client.delete(`train-logs/${id}`);

        return response;
    }

    async update(id: TrainLog['id'], data: Partial<TrainLog>): Promise<SingleResourceResponse<TrainLog>> {
        const { data: response } = await this.client.post(`train-logs/${id}`, data);

        return response;
    }

    async create(data: Partial<TrainLog>): Promise<SingleResourceResponse<TrainLog>> {
        const { data: response } = await this.client.post('train-logs', data);

        return response;
    }
}
