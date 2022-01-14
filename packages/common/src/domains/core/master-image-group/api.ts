/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { AxiosInstance } from 'axios';

import { MasterImageGroup } from './entity';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class MasterImageGroupAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getMany(data?: BuildInput<MasterImageGroup>): Promise<CollectionResourceResponse<MasterImageGroup>> {
        const response = await this.client.get(`master-image-groups${buildQuery(data)}`);
        return response.data;
    }

    async getOne(id: MasterImageGroup['id']): Promise<SingleResourceResponse<MasterImageGroup>> {
        const response = await this.client.delete(`master-image-groups/${id}`);
        return response.data;
    }
}
