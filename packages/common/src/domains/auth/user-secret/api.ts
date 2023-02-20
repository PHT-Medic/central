/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import type { ClientDriverInstance } from 'hapic';
import { nullifyEmptyObjectProperties } from '../../../utils';
import type { UserSecret } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class UserSecretAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(options?: BuildInput<UserSecret>): Promise<CollectionResourceResponse<UserSecret>> {
        const response = await this.client.get(`user-secrets${buildQuery(options)}`);

        return response.data;
    }

    async getOne(
        id: UserSecret['id'],
        options?: BuildInput<UserSecret>,
    ): Promise<SingleResourceResponse<UserSecret>> {
        const response = await this.client.get(`user-secrets/${id}${buildQuery(options)}`);

        return response.data;
    }

    async delete(id: UserSecret['id']): Promise<SingleResourceResponse<UserSecret>> {
        const response = await this.client.delete(`user-secrets/${id}`);

        return response.data;
    }

    async create(data: Partial<UserSecret>): Promise<SingleResourceResponse<UserSecret>> {
        const response = await this.client.post('user-secrets', nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async update(
        id: UserSecret['id'],
        data: Partial<UserSecret>,
    ): Promise<SingleResourceResponse<UserSecret>> {
        const response = await this.client.post(`user-secrets/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }
}
