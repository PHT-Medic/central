/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/data-fetching";
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../../modules";
import {Role} from "./entity";

export async function getAPIRoles(data?: RequestRecord<Role>) : Promise<CollectionResourceResponse<Role>> {
    let response = await useAPI(APIType.DEFAULT).get('roles' + formatRequestRecord(data));

    return response.data;
}

export async function getAPIRole(roleId: number) : Promise<SingleResourceResponse<Role>>  {
    let response = await useAPI(APIType.DEFAULT).get('roles/' + roleId);

    return response.data;
}

export async function dropAPIRole(roleId: number) : Promise<SingleResourceResponse<Role>>  {
    let response = await useAPI(APIType.DEFAULT).delete('roles/' + roleId);

    return response.data;
}

export async function addAPIRole(data: Pick<Role, 'name' | 'provider_role_id'>) : Promise<SingleResourceResponse<Role>>  {
    let response = await useAPI(APIType.DEFAULT).post('roles', data);

    return response.data;
}

export async function editAPIRole(id: number, data: Pick<Role, 'name' | 'provider_role_id'>) : Promise<SingleResourceResponse<Role>> {
    let response = await useAPI(APIType.DEFAULT).post('roles/' + id, data);

    return response.data;
}
