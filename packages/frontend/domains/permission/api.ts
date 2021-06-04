import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getPermissions(data?: RequestRecord) {
    const response = await useApi('auth').get('permissions'+formatRequestRecord(data));
    return response.data;
}
