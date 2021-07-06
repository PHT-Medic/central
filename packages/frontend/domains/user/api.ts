import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getUsers(options?: RequestRecord) {
    const response = await useApi('auth').get('users' + formatRequestRecord(options));

    return response.data;
}

export async function getUser(id: number) {
    const response = await useApi('auth').get('users/'+id);

    return response.data;
}

export async function dropUser(id: number) {
    const response = await useApi('auth').delete('users/'+id);

    return response.data;
}

export async function addUser(data: {[key: string] : any}) {
    const response = await useApi('auth').post('users',data);

    return response.data;
}

export async function editUser(userId: number, data: {[key: string] : any}) {
    const response = await useApi('auth').post('users/'+userId, data);

    return response.data;
}
