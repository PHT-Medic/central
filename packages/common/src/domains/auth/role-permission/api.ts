/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/query";
import {
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI, APIType
} from "../../../modules";
import {RolePermission} from "./entity";

export async function getRolePermissions(data?: RequestRecord<RolePermission>) : Promise<CollectionResourceResponse<RolePermission>> {
    const response = await useAPI(APIType.DEFAULT).get('role-permissions' + formatRequestRecord(data));
    return response.data;
}

export async function getRolePermission(id: typeof RolePermission.prototype.id) : Promise<SingleResourceResponse<RolePermission>> {
    const response = await useAPI(APIType.DEFAULT).get('role-permissions/' + id);

    return response.data;
}

export async function dropRolePermission(id: typeof RolePermission.prototype.id) : Promise<SingleResourceResponse<RolePermission>> {
    let response = await useAPI(APIType.DEFAULT).delete('role-permissions/' + id);

    return response.data;
}

export async function addRolePermission(data: Pick<RolePermission, 'role_id' | 'permission_id'>) : Promise<SingleResourceResponse<RolePermission>> {
    let response = await useAPI(APIType.DEFAULT).post('role-permissions', data);

    return response.data;
}
