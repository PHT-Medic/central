/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { BaseAPI } from '../base';

import type { MasterImageGroup } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class MasterImageGroupAPI extends BaseAPI {
    async getMany(data?: BuildInput<MasterImageGroup>): Promise<CollectionResourceResponse<MasterImageGroup>> {
        const response = await this.client.get(`master-image-groups${buildQuery(data)}`);
        return response.data;
    }

    async getOne(id: MasterImageGroup['id']): Promise<SingleResourceResponse<MasterImageGroup>> {
        const response = await this.client.delete(`master-image-groups/${id}`);
        return response.data;
    }
}
