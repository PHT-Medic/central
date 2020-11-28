import {useApi} from "@/modules/api";
import {changeRequestKeyCase} from "~/modules/api/utils";
import {clearObjectProperties} from "~/modules/utils";

export async function getRoles() {
    try {
        let response = await useApi('auth').get('roles');

        return response.data;
    } catch (e) {
        throw new Error('Die Rollen konnten nicht geladen werden.');
    }
}

export async function getRole(roleId: number) {
    try {
        let response = await useApi('auth').get('roles/'+roleId);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht geladen werden.');
    }
}

export async function dropRole(roleId: number) {
    try {
        let response = await useApi('auth').delete('roles/'+roleId);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht gelöscht werden.');
    }
}

export async function addRole(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('roles', clearObjectProperties(changeRequestKeyCase(data)));

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht erstellt werden.');
    }
}

export async function editRole(id : number, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('roles/'+id, clearObjectProperties(changeRequestKeyCase(data)));

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht erstellt werden.');
    }
}
