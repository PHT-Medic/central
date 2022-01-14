/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import { AxiosInstance } from 'axios';
import { Proposal } from './entity';
import { nullifyEmptyObjectProperties } from '../../../utils';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class UserAPI {
    protected client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getMany(record?: BuildInput<Proposal>): Promise<CollectionResourceResponse<Proposal>> {
        const response = await this.client.get(`proposals${buildQuery(record)}`);
        return response.data;
    }

    async getOne(id: Proposal['id'], requestRecord?: BuildInput<Proposal>): Promise<SingleResourceResponse<Proposal>> {
        const response = await this.client.get(`proposals/${id}${buildQuery(requestRecord)}`);

        return response.data;
    }

    async create(data: Record<string, any>): Promise<SingleResourceResponse<Proposal>> {
        const response = await this.client.post('proposals', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: Proposal['id']): Promise<SingleResourceResponse<Proposal>> {
        const response = await this.client.delete(`proposals/${id}`);
        return response.data;
    }

    async update(id: Proposal['id'], data: Record<string, any>): Promise<SingleResourceResponse<Proposal>> {
        const response = await this.client.post(`proposals/${id}`, nullifyEmptyObjectProperties(data));
        return response.data;
    }
}
