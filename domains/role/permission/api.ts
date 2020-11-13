import {useApi} from "~/modules/api";
import {buildUrlRelationSuffix, changeResponseKeyCase, changeRequestKeyCase} from "~/modules/api/utils";

export async function getRolePermissions(roleId: number, type: 'self' | 'related') {
    let url = buildUrlRelationSuffix('roles', roleId,type);

    try {
        let response = await useApi('auth').get(url);
        let data = response.data;

        return changeResponseKeyCase(data);
    } catch (e) {
        throw new Error('Die Benutzer Berechtigungen konnten nicht geladen werden.');
    }
}

export async function getRolePermission(roleId: number, permissionId: number, type: 'self' | 'related') {
    let url = buildUrlRelationSuffix('roles',roleId,type);

    url += '/'+permissionId;

    try {
        let response = await useApi('auth').get(url);
        let data = response.data;

        return changeResponseKeyCase(data);
    } catch (e) {
        throw new Error('Die Berechtigung für den Benutzer existiert nicht.');
    }
}


export async function dropRolePermission(roleId: number, id: number, type: 'self' | 'related') {
    type = type ?? 'self';
    let url = buildUrlRelationSuffix('roles', roleId, type);

    url += '/'+id;

    try {
        let response = await useApi('auth').delete(url);

        return response.data;
    } catch (e) {
        throw new Error('Die Zuweisung der Berechtigung konnte nicht rückgängig gemacht werden.');
    }
}

export async function dropRolePermissionByRelationId(roleId: number, relationId: number) {
    return dropRolePermission(roleId, relationId, 'self');
}

export async function dropRolePermissionByResourceId(roleId: number, relationId: number) {
    return dropRolePermission(roleId, relationId, 'related');
}

//----------------------------------------------------

export async function addRolePermission(roleId: number, data: Record<string, any>) {
    let url = buildUrlRelationSuffix('roles', roleId,'self');

    data = changeRequestKeyCase(data);

    try {
        let response = await useApi('auth').post(url,data);

        return response.data;
    } catch (e) {
        throw new Error('Die Berechtigung konnte nicht zugewiesen werden.');
    }
}

export async function editRolePermission(roleId: number, id: number, data: Record<string, any>) {
    let url = buildUrlRelationSuffix('roles', roleId,'self');

    url += '/'+id;

    data = changeRequestKeyCase(data);

    try {
        let response = await useApi('auth').post(url,data);

        return response.data;
    } catch (e) {
        throw new Error('Die Einstellungen für die Berechtigung konnten nicht vorgenommen werden.');
    }
}
