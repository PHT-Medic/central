/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { AxiosInstance } from 'axios';
import { TrainStation } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainStationAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getAPITrainStations(options?: BuildInput<TrainStation>): Promise<CollectionResourceResponse<TrainStation>> {
        const { data: response } = await this.client.get(`train-stations${buildQuery(options)}`);
        return response;
    }

    async getAPITrainStation(id: TrainStation['id']): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.get(`train-stations/${id}`);

        return response;
    }

    async dropAPITrainStation(id: TrainStation['id']): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.delete(`train-stations/${id}`);

        return response;
    }

    async editAPITrainStation(id: number, data: Partial<TrainStation>): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.post(`train-stations/${id}`, data);

        return response;
    }

    async addAPITrainStation(data: Partial<TrainStation>): Promise<SingleResourceResponse<TrainStation>> {
        const { data: response } = await this.client.post('train-stations', data);

        return response;
    }
}
