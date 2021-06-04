import {useApi} from "~/modules/api";
import {
    buildUrlRelationsSuffix,
    changeResponseKeyCase,
    changeRequestKeyCase,
    RequestRecord,
    formatRequestRecord
} from "~/modules/api/utils";

export async function getRolePermissions(data?: RequestRecord) {
    const response = await useApi('auth').get('role-permissions'+formatRequestRecord(data));
    return response.data;
}

export async function getRolePermission(id: number | string) {
    const response = await useApi('auth').get('role-permissions/'+id);

    return response.data;
}

export async function dropRolePermission(id: number | string) {
    let response = await useApi('auth').delete('role-permissions/'+id);

    return response.data;
}

export async function addRolePermission(data: Record<string, any>) {
    let response = await useApi('auth').post('role-permissions',data);

    return response.data;
}
