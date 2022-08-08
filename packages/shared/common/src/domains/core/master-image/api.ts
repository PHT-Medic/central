/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from 'rapiq';

import { ClientDriverInstance } from 'hapic';
import { MasterImage } from './entity';
import { MasterImageCommand } from './type';
import { CollectionResourceResponse, SingleResourceResponse } from '../../type';

export class MasterImageAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(data?: BuildInput<MasterImage>): Promise<CollectionResourceResponse<MasterImage>> {
        const response = await this.client.get(`master-images${buildQuery(data)}`);
        return response.data;
    }

    async getOne(
        id: MasterImage['id'],
        data?: BuildInput<MasterImage>,
    ): Promise<SingleResourceResponse<MasterImage>> {
        const response = await this.client.get(`master-images/${id}${buildQuery(data)}`);
        return response.data;
    }

    async delete(id: MasterImage['id']): Promise<SingleResourceResponse<MasterImage>> {
        const response = await this.client.delete(`master-images/${id}`);
        return response.data;
    }

    async runCommand(
        command: MasterImageCommand,
        data: Record<string, any> = {},
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        const actionData = {
            command,
            ...data,
        };

        const { data: response } = await this.client.post('master-images/command', actionData);

        return response;
    }
}
