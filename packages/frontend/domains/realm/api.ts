import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getRealms(data?: RequestRecord) {
    let response = await useApi('auth').get('realms' + formatRequestRecord(data));

    return response.data;
}

export async function getRealm(id: string) {
    try {
        let response = await useApi('auth').get('realms/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropRealm(id: string) {
    try {
        let response = await useApi('auth').delete('realms/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Realm mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function addRealm(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('realms',changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm konnte nicht erstellt werden.');
    }
}

export async function editRealm(realmId: string, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('realms/'+realmId, changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm konnte nicht editiert werden.');
    }
}
