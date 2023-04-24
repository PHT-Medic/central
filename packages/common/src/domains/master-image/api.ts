/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';

import { BaseAPI } from '../base';
import type { MasterImage } from './entity';
import type { MasterImageCommand } from './constants';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class MasterImageAPI extends BaseAPI {
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
