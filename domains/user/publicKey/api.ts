import {useApi} from "~/modules/api";

export async function getUserPublicKey() {
    const response = await useApi('auth').get('user-public-keys');
    return response.data
}

export async function addUserKey(data: Record<string, any>) {
    const response = await useApi('auth').post('user-public-keys', data);
    return response.data
}

export async function editUserKey(publicKeyId: number, data: Record<string, any>) {
    const response = await useApi('auth').post('user-public-keys/' + publicKeyId, data);
    return response.data
}

export async function dropUserKey(publicKeyId: number) {
    const response = await useApi('auth').delete('user-public-keys/'+publicKeyId);
    return response.data
}
