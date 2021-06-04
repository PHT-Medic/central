import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getApiRealmStation(realmId: number, requestRecord?: RequestRecord) {
    const response = await useApi('auth').get('realms/'+realmId+'/station' + formatRequestRecord(requestRecord));

    return response.data;
}
