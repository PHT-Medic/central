/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { ClientDriverInstance } from '@trapi/client';
import { TrainStation } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainStationAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<TrainStation>): Promise<CollectionResourceResponse<TrainStation>> {
        const { data: response } = await this.client.get(`train-stations${buildQuery(options)}`);
        return response;
    }

    async getOne(id: TrainStation['id']): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.get(`train-stations/${id}`);

        return response;
    }

    async delete(id: TrainStation['id']): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.delete(`train-stations/${id}`);

        return response;
    }

    async update(id: number, data: Partial<TrainStation>): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.post(`train-stations/${id}`, data);

        return response;
    }

    async create(data: Partial<TrainStation>): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.post('train-stations', data);

        return response;
    }
}
