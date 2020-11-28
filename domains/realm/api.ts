import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase} from "~/modules/api/utils";

export async function getRealms() {
    try {
        let response = await useApi('auth').get('auth/realms');

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realms konnten nicht geladen werden.');
    }
}

export async function getRealm(id: string) {
    try {
        let response = await useApi('auth').get('auth/realms/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropRealm(id: string) {
    try {
        let response = await useApi('auth').delete('auth/realms/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Realm mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function addRealm(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('auth/realms',changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm konnte nicht erstellt werden.');
    }
}

export async function editRealm(realmId: string, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('auth/realms/'+realmId, changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Realm konnte nicht editiert werden.');
    }
}
