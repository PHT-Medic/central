/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from 'rapiq';
import { ClientDriverInstance, ClientRequestConfig } from 'hapic';
import { Train } from './entity';
import { nullifyEmptyObjectProperties } from '../../../utils';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';
import { TrainCommand } from './constants';

export class TrainAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    getResultUrl(id: Train['id']) {
        return new URL(`trains/${id}/result/download`, this.client.defaults.baseURL);
    }

    async getMany(
        options?: BuildInput<Train>,
    ): Promise<CollectionResourceResponse<Train>> {
        const { data: response } = await this.client.get(`trains${buildQuery(options)}`);
        return response;
    }

    async getOne(
        id: Train['id'],
        options?: BuildInput<Train>,
        requestConfig?: ClientRequestConfig,
    ): Promise<SingleResourceResponse<Train>> {
        const { data: response } = await this.client
            .get(`trains/${id}${buildQuery(options)}`, requestConfig);

        return response;
    }

    async delete(id: Train['id']): Promise<SingleResourceResponse<Train>> {
        const { data: response } = await this.client.delete(`trains/${id}`);

        return response;
    }

    async update(id: Train['id'], data: Partial<Train>): Promise<SingleResourceResponse<Train>> {
        const { data: response } = await this.client.post(`trains/${id}`, nullifyEmptyObjectProperties(data));

        return response;
    }

    async create(data: Partial<Train>): Promise<SingleResourceResponse<Train>> {
        const { data: response } = await this.client.post('trains', nullifyEmptyObjectProperties(data));

        return response;
    }

    async runCommand(
        id: Train['id'],
        command: `${TrainCommand}` | TrainCommand,
        data: Record<string, any> = {},
    ): Promise<SingleResourceResponse<Train>> {
        const actionData = {
            command,
            ...data,
        };

        const { data: response } = await this.client
            .post(`trains/${id}/command`, actionData);

        return response;
    }
}
