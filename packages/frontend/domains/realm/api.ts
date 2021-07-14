import {useApi} from "~/modules/api";
import {changeRequestKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getRealms(data?: RequestRecord) {
    let response = await useApi('auth').get('realms' + formatRequestRecord(data));

    return response.data;
}

export async function getRealm(id: string) {
    let response = await useApi('auth').get('realms/'+id);

    return response.data;
}

export async function dropRealm(id: string) {
    let response = await useApi('auth').delete('realms/'+id);

    return response.data;
}

export async function addRealm(data: {[key: string] : any}) {
    let response = await useApi('auth').post('realms',changeRequestKeyCase(data));

    return response.data;
}

export async function editRealm(realmId: string, data: {[key: string] : any}) {
    let response = await useApi('auth').post('realms/'+realmId, changeRequestKeyCase(data));

    return response.data;
}
