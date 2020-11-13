import {useApi} from "~/modules/api";

export async function getUserPublicKey() {
    const response = await useApi('resource').get('users/publicKey');
    return response.data
}

export async function dropUserKey() {
    const response = await useApi('resource').delete('users/publicKey');
    return response.data
}

export async function addUserKey(publicKey: string) {
    const response = await useApi('resource').post('users/publicKey', {public_key: publicKey});
    return response.data
}
