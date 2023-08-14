/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import { buildQuery } from 'rapiq';
import { nullifyEmptyObjectProperties } from '../../utils';
import { BaseAPI } from '../base';
import type { ProposalStation } from './entity';
import type { CollectionResourceResponse, SingleResourceResponse } from '../types-base';

export class ProposalStationAPI extends BaseAPI {
    async getMany(data?: BuildInput<ProposalStation>): Promise<CollectionResourceResponse<ProposalStation>> {
        const response = await this.client.get(`proposal-stations${buildQuery(data)}`);

        return response.data;
    }

    async getOne(id: ProposalStation['id'], data?: BuildInput<ProposalStation>): Promise<SingleResourceResponse<ProposalStation>> {
        const response = await this.client.get(`proposal-stations/${id}${buildQuery(data)}`);

        return response.data;
    }

    async create(data: Partial<ProposalStation>): Promise<SingleResourceResponse<ProposalStation>> {
        const response = await this.client.post('proposal-stations', data);

        return response.data;
    }

    async update(id: ProposalStation['id'], data: Partial<ProposalStation>): Promise<SingleResourceResponse<ProposalStation>> {
        const response = await this.client.post(`proposal-stations/${id}`, nullifyEmptyObjectProperties(data));

        return response.data;
    }

    async delete(id: ProposalStation['id']): Promise<SingleResourceResponse<ProposalStation>> {
        const response = await this.client.delete(`proposal-stations/${id}`);

        return response.data;
    }
}
