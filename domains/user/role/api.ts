import {buildUrlRelationsSuffix} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getApiUserRoles(userId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('users', userId, 'roles', type);

    try {
        const response = await useApi('auth').get(url);

        return response.data;
    } catch (e) {
        throw new Error('Die Benutzer Rollen konnten nicht geladen werden.');
    }
}

export async function getApiUserRole(userId: number, roleId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('users', userId, 'roles', type);

    url += '/'+roleId;

    try {
        const response = await useApi('auth').get(url);

        return response.data;
    } catch (e) {
        throw new Error('Die Rollen für den Benutzer existiert nicht.');
    }
}

export async function dropUserRole(userId: number, id: number, type: 'self' | 'related') {
    type = type ?? 'self';
    let url = buildUrlRelationsSuffix('users', userId, 'roles', type);

    url += '/'+id;

    try {
        let response = await useApi('auth').delete(url);

        return response.data;
    } catch (e) {
        throw new Error('Die Zuweisung der Rolle konnte nicht rückgängig gemacht werden.');
    }
}

export async function dropUserRoleByRelationId(roleId: number, relationId: number) {
    return dropUserRole(roleId, relationId, 'self');
}

export async function dropUserRoleByResourceId(roleId: number, resourceId: number) {
    return dropUserRole(roleId, resourceId, 'related');
}

//----------------------------------------------------

export async function addUserRole(userId: number, data: Record<string, any>) {
    let url = buildUrlRelationsSuffix('users', userId, 'roles', 'self');

    try {
        const response = await useApi('auth').post(url,data);

        return response.data;
    } catch (e) {
        throw new Error('Die Berechtigung konnte nicht zugewiesen werden.');
    }
}
