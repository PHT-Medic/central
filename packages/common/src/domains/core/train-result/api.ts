/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { AxiosInstance } from 'axios';
import { TrainResult } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainResultAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<TrainResult>): Promise<CollectionResourceResponse<TrainResult>> {
        const { data: response } = await this.client.get(`train-results${buildQuery(options)}`);
        return response;
    }

    async getOne(
        id: TrainResult['id'],
        options?: BuildInput<TrainResult>,
    ): Promise<SingleResourceResponse<TrainResult>> {
        const { data: response } = await this.client.get(`train-results/${id}${buildQuery(options)}`);

        return response;
    }

    async delete(
        id: TrainResult['id'],
    ): Promise<SingleResourceResponse<TrainResult>> {
        const { data: response } = await this.client.delete(`train-results/${id}`);

        return response;
    }
}
