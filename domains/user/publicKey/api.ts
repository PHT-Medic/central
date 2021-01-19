import {useApi} from "~/modules/api";

export async function getUserKeyRing() {
    const response = await useApi('auth').get('user-key-rings');
    return response.data
}

export async function addUserKeyRing(data: Record<string, any>) {
    const response = await useApi('auth').post('user-key-rings', data);
    return response.data
}

export async function editUserKeyRing(publicKeyId: number, data: Record<string, any>) {
    const response = await useApi('auth').post('user-key-rings/' + publicKeyId, data);
    return response.data
}

export async function dropUserKeyRing(publicKeyId: number) {
    const response = await useApi('auth').delete('user-key-rings/'+publicKeyId);
    return response.data
}
