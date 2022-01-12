/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import {
    APIType, CollectionResourceResponse, SingleResourceResponse, useAPI,
} from '../../../modules';
import { nullifyEmptyObjectProperties } from '../../../utils';
import { UserSecret } from './entity';

export async function getAPIUserSecrets(options?: BuildInput<UserSecret>) : Promise<CollectionResourceResponse<UserSecret>> {
    const response = await useAPI(APIType.DEFAULT).get(`user-secrets${buildQuery(options)}`);

    return response.data;
}

export async function getAPIUserSecret(
    id: UserSecret['id'],
    options?: BuildInput<UserSecret>,
) : Promise<SingleResourceResponse<UserSecret>> {
    const response = await useAPI(APIType.DEFAULT).get(`user-secrets/${id}${buildQuery(options)}`);

    return response.data;
}

export async function dropAPIUserSecret(id: UserSecret['id']) : Promise<SingleResourceResponse<UserSecret>> {
    const response = await useAPI(APIType.DEFAULT).delete(`user-secrets/${id}`);

    return response.data;
}

export async function addAPIUserSecret(data: Partial<UserSecret>) : Promise<SingleResourceResponse<UserSecret>> {
    const response = await useAPI(APIType.DEFAULT).post('user-secrets', nullifyEmptyObjectProperties(data));

    return response.data;
}

export async function editAPIUserSecret(
    id: UserSecret['id'],
    data: Partial<UserSecret>,
) : Promise<SingleResourceResponse<UserSecret>> {
    const response = await useAPI(APIType.DEFAULT).post(`user-secrets/${id}`, nullifyEmptyObjectProperties(data));

    return response.data;
}
