/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';
import type { TrainFile } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class TrainFileAPI extends BaseAPI {
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
        });

        return response.data;
    }
}
