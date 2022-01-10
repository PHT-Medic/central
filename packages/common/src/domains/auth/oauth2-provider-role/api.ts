/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from '@trapi/query';
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI,
} from '../../../modules';
import { OAuth2ProviderRole } from './entity';

export async function getApiOauth2ProviderRoles(data: BuildInput<OAuth2ProviderRole>) : Promise<CollectionResourceResponse<OAuth2ProviderRole>> {
    const response = await useAPI(APIType.DEFAULT).get(`provider-roles${buildQuery(data)}`);

    return response.data;
}

export async function getApiOauth2ProviderRole(id: typeof OAuth2ProviderRole.prototype.id) : Promise<SingleResourceResponse<OAuth2ProviderRole>> {
    const response = await useAPI(APIType.DEFAULT).get(`provider-roles/${id}`);

    return response.data;
}

export async function dropAPIOauth2ProviderRole(id: typeof OAuth2ProviderRole.prototype.id) : Promise<SingleResourceResponse<OAuth2ProviderRole>> {
    const response = await useAPI(APIType.DEFAULT).delete(`provider-roles/${id}`);

    return response.data;
}

export async function addAPIOauth2ProviderRole(data: Partial<OAuth2ProviderRole>) : Promise<SingleResourceResponse<OAuth2ProviderRole>> {
    const response = await useAPI(APIType.DEFAULT).post('provider-roles', data);

    return response.data;
}

export async function editAPIOauth2ProviderRole(
    id: typeof OAuth2ProviderRole.prototype.id,
    data: Partial<OAuth2ProviderRole>,
) : Promise<SingleResourceResponse<OAuth2ProviderRole>> {
    const response = await useAPI(APIType.DEFAULT).post(`provider-roles/${id}`, data);

    return response.data;
}
