/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { Train } from './entity';
import { nullifyEmptyObjectProperties } from '../../utils';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';
import type { TrainAPICommand } from './constants';

export class TrainAPI extends BaseAPI {
    getResultDownloadPath(id: Train['id']) {
        return `trains/${id}/result/download`;
    }

    getResultDownloadURL(id: Train['id']) {
        return new URL(
            this.getResultDownloadPath(id),
            this.client.getBaseURL(),
        ).href;
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
        requestConfig?: RequestBaseOptions,
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
        command: `${TrainAPICommand}` | TrainAPICommand,
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
