/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import { Train } from '../train';
import { TrainFile } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class TrainFileAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    getDownloadURI(
        trainId: Train['id'],
    ): string {
        return `trains/${trainId}/files/download`;
    }

    async getMany(
        trainId: Train['id'],
    ): Promise<CollectionResourceResponse<TrainFile>> {
        const response = await this.client.get(`trains/${trainId}/files`);

        return response.data;
    }

    async getOne(
        trainId: Train['id'],
        fileId: TrainFile['id'],
    ): Promise<SingleResourceResponse<TrainFile>> {
        const response = await this.client.get(`trains/${trainId}/files/${fileId}`);

        return response.data;
    }

    async delete(
        trainId: Train['id'],
        fileId: TrainFile['id'],
    ): Promise<SingleResourceResponse<TrainFile>> {
        const response = await this.client.delete(`trains/${trainId}/files/${fileId}`);

        return response.data;
    }

    async upload(
        trainId: Train['id'],
        formData: any,
    ): Promise<CollectionResourceResponse<TrainFile>> {
        const response = await this.client.post(`trains/${trainId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 10000,
        });

        return response.data;
    }
}
