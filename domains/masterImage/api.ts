import {useApi} from "~/modules/api";

export async function getMasterImages() {
    const response = await useApi('resource').get('master-images');
    return response.data;
}
