/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildQuery, BuildInput} from "@trapi/query";
import {
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI, APIType
} from "../../../modules";
import {OAuth2Provider} from "./entity";
import {nullifyEmptyObjectProperties} from "../../../utils";

export function getProviderAuthorizeUri(id: typeof OAuth2Provider.prototype.id) : string {
    const baseUrl: string = useAPI(APIType.DEFAULT).config.baseURL ?? '';

    return baseUrl + 'providers/' + id + '/authorize-url';
}

export async function getAPIProviders(record?: BuildInput<OAuth2Provider>) : Promise<CollectionResourceResponse<OAuth2Provider>> {
    let response = await useAPI(APIType.DEFAULT).get('providers' + buildQuery(record));

    return response.data;
}

export async function getAPIProvider(id: typeof OAuth2Provider.prototype.id) : Promise<SingleResourceResponse<OAuth2Provider>>  {
    let response = await useAPI(APIType.DEFAULT).get('providers/' + id);

    return response.data;
}

export async function dropAPIProvider(id: typeof OAuth2Provider.prototype.id) : Promise<SingleResourceResponse<OAuth2Provider>>{
    let response = await useAPI(APIType.DEFAULT).delete('providers/' + id);

    return response.data;
}

export async function addAPIProvider(data: Partial<OAuth2Provider>): Promise<SingleResourceResponse<OAuth2Provider>> {
    let response = await useAPI(APIType.DEFAULT).post('providers', nullifyEmptyObjectProperties(data));

    return response.data;
}

export async function editAPIProvider(userId: number, data: Partial<OAuth2Provider>): Promise<SingleResourceResponse<OAuth2Provider>> {
    let response = await useAPI(APIType.DEFAULT).post('providers/' + userId, nullifyEmptyObjectProperties(data));

    return response.data;
}
