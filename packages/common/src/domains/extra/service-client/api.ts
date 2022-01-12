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

export async function getAPIServiceClients(options?: BuildInput<Record<string, any>>): Promise<CollectionResourceResponse<Record<string, any>>> {
    const { data } = await useAPI(APIType.DEFAULT).get(`service-clients${buildQuery(options)}`);

    return data;
}

export async function getAPIServiceClient(
    id: string,
    options?: BuildInput<Record<string, any>>,
): Promise<SingleResourceResponse<Record<string, any>>> {
    const { data } = await useAPI(APIType.DEFAULT).get(`service-clients/${id}${buildQuery(options)}`);

    return data;
}
