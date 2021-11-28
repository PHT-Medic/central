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

import { MasterImage } from './entity';
import { MasterImageCommand } from './type';

export async function getAPIMasterImages(data?: BuildInput<MasterImage>) : Promise<CollectionResourceResponse<MasterImage>> {
    const response = await useAPI(APIType.DEFAULT).get(`master-images${buildQuery(data)}`);
    return response.data;
}

export async function getAPIMasterImage(
    id: typeof MasterImage.prototype.id,
    data?: BuildInput<MasterImage>,
) : Promise<SingleResourceResponse<MasterImage>> {
    const response = await useAPI(APIType.DEFAULT).get(`master-images/${id}${buildQuery(data)}`);
    return response.data;
}

export async function dropAPIMasterImage(id: typeof MasterImage.prototype.id) : Promise<SingleResourceResponse<MasterImage>> {
    const response = await useAPI(APIType.DEFAULT).delete(`master-images/${id}`);
    return response.data;
}

export async function runAPITMasterImagesCommand(
    command: MasterImageCommand,
    data: Record<string, any> = {},
) : Promise<SingleResourceResponse<Record<string, any>>> {
    const actionData = {
        command,
        ...data,
    };

    const { data: response } = await useAPI(APIType.DEFAULT).post('master-images/command', actionData);

    return response;
}
