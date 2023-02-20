/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientDriverInstance } from 'hapic';
import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { TrainFile } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainFileAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(
        options?: BuildInput<TrainFile>,
    ): Promise<CollectionResourceResponse<TrainFile>> {
        const response = await this.client.get(`train-files/${buildQuery(options)}`);

        return response.data;
    }

    async getOne(
        id: TrainFile['id'],
    ): Promise<SingleResourceResponse<TrainFile>> {
        const response = await this.client.get(`train-files/${id}`);

        return response.data;
    }

    async delete(
        id: TrainFile['id'],
    ): Promise<SingleResourceResponse<TrainFile>> {
        const response = await this.client.delete(`train-files/${id}`);

        return response.data;
    }

    async upload(formData: any): Promise<CollectionResourceResponse<TrainFile>> {
        const response = await this.client.post('train-files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 10000,
        });

        return response.data;
    }
}
