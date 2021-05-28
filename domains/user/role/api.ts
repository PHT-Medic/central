import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getApiUserRoles(data: RequestRecord) {
    const response = await useApi('auth').get('user-roles' + formatRequestRecord(data));

    return response.data;
}

export async function getApiUserRole(id: string | number) {
    const response = await useApi('auth').get('user-roles/'+id);

    return response.data;
}

export async function dropUserRole(id: string | number) {
    let response = await useApi('auth').delete('user-roles/'+id);

    return response.data;
}

//----------------------------------------------------

export async function addUserRole(data: Record<string, any>) {
    const response = await useApi('auth').post('user-roles',data);

    return response.data;
}
