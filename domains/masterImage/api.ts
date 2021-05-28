import {useApi} from "~/modules/api";

export async function getMasterImages() {
    const response = await useApi('auth').get('master-images');
    return response.data;
}
