/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import {
    APIType,
    CollectionResourceResponse, SingleResourceResponse, useAPI,
} from '../../../modules';

import { MasterImageGroup } from './entity';
import { MasterImage } from '../master-image';

export async function getAPIMasterImageGroups(data?: BuildInput<MasterImageGroup>) : Promise<CollectionResourceResponse<MasterImageGroup>> {
    const response = await useAPI(APIType.DEFAULT).get(`master-image-groups${buildQuery(data)}`);
    return response.data;
}

export async function getAPIMasterImageGroup(id: MasterImageGroup['id']) : Promise<SingleResourceResponse<MasterImageGroup>> {
    const response = await useAPI(APIType.DEFAULT).delete(`master-image-groups/${id}`);
    return response.data;
}
