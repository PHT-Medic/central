import {useApi} from "~/modules/api";

export async function getUsers() {
    try {
        let response = await useApi('auth').get('users');

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer konnten nicht geladen werden.');
    }
}

export async function getUser(id: number) {
    try {
        let response = await useApi('auth').get('users/'+id);

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropUser(id: number) {
    try {
        let response = await useApi('auth').delete('users/'+id);

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function addUser(data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('users',data);

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer konnte nicht erstellt werden.');
    }
}

export async function editUser(userId: number, data: {[key: string] : any}) {
    try {
        let response = await useApi('auth').post('users/'+userId, data);

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer konnte nicht erstellt werden.');
    }
}
