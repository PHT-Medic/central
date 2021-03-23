import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getProviders(record?: RequestRecord) {
    try {
        let response = await useApi('auth').get('auth/providers' + formatRequestRecord(record));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Provider konnten nicht geladen werden.');
    }
}

export async function getProvider(id: number) {
    try {
        let response = await useApi('auth').get('auth/providers/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropProvider(id: number) {
    try {
        let response = await useApi('auth').delete('auth/providers/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function addProvider(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('auth/providers',changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider konnte nicht erstellt werden.');
    }
}

export async function editProvider(userId: number, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('auth/providers/'+userId, changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Provider konnte nicht editiert werden.');
    }
}
