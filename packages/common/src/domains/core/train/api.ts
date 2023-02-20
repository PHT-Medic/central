/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { ClientDriverInstance, ClientRequestConfig } from 'hapic';
import type { Train } from './entity';
import { nullifyEmptyObjectProperties } from '../../../utils';
import type { CollectionResourceResponse, SingleResourceResponse } from '../../type';
import type { TrainCommand } from './constants';

export class TrainAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    getResultDownloadPath(id: Train['id']) {
        return `trains/${id}/result/download`;
    }

    getFilesDownloadPath(
        trainId: Train['id'],
    ): string {
        return `trains/${trainId}/files/download`;
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

    async streamFiles(id: Train['id']) {
        const response = await this.client.get(this.getFilesDownloadPath(id), {
            responseType: 'stream',
        });

        return response.data;
    }

    async downloadResult(id: Train['id']) {
        const response = await this.client.get(this.getResultDownloadPath(id), {
            responseType: 'stream',
        });

        return response.data;
    }
}
