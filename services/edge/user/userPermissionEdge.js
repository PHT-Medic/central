import AuthApiService from "../../api/authApi";
import {formatToEdgeRequestObject, parseEdgeResponseObject} from "../helpers/edgeHelpers";
import {PermissionEdgeMapping} from "../permission/permissionEdge";

const buildUrlPrefixUrl = (userId, type) => {
    let url = 'users/'+userId;

    switch (type) {
        case 'self':
            url += '/relationships'
            break;
        case 'related':
            break;
    }

    url += '/permissions';

    return url;
}

//----------------------------------------------------

const UserPermissionEdgeMapping = {
    id: 'id',
    userId: 'user_id',
    permissionId: 'permission_id',
    power: 'power',
    powerInverse: 'power_inverse',
    scope: 'scope',
    condition: 'condition',
    enabled: 'enabled',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
}

//----------------------------------------------------

const UserPermissionEdge = {
    getUserPermissions: async(userId, type) => {
        let url = buildUrlPrefixUrl(userId,type);

        try {
            let response = await AuthApiService.get(url);
            let data = response.data;

            switch (type) {
                case 'self':
                    data = data.map((item) => {
                        return parseEdgeResponseObject(item,UserPermissionEdgeMapping);
                    })
                    break;
                case 'related':
                    data = data.map((item) => {
                        return parseEdgeResponseObject(item,PermissionEdgeMapping);
                    });
                    break;
            }

            return data;
        } catch (e) {
            throw new Error('Die Benutzer Berechtigungen konnten nicht geladen werden.');
        }
    },
    getUserPermission: async(userId, permissionId, type) => {
        let url = buildUrlPrefixUrl(userId,type);

        url += '/'+permissionId;

        try {
            let response = await AuthApiService.get(url);
            let data = response.data;

            switch (type) {
                case 'self':
                    data = parseEdgeResponseObject(data,UserPermissionEdgeMapping);
                    break;
                case 'related':
                    data = parseEdgeResponseObject(data,PermissionEdgeMapping);
                    break;
            }

            return data;
        } catch (e) {
            throw new Error('Die Berechtigung für den Benutzer existiert nicht.');
        }
    },

    //----------------------------------------------------

    dropUserPermission: async(userId, id, type) => {
        type = type ?? 'self';
        let url = buildUrlPrefixUrl(userId,type);

        url += '/'+id;

        try {
            let response = await AuthApiService.delete(url);

            return response.data;
        } catch (e) {
            throw new Error('Die Zuweisung der Berechtigung konnte nicht rückgängig gemacht werden.');
        }
    },
    dropUserPermissionByRelationId: async function(userId, relationId) {
        return this.dropUserPermission(userId, relationId, 'self');
    },
    dropUserPermissionByResourceId: async function(userId, resourceId) {
        return this.dropUserPermission(userId, resourceId, 'related');
    },

    //----------------------------------------------------

    addUserPermission: async (userId, data) => {
        let url = buildUrlPrefixUrl(userId,'self');

        data = formatToEdgeRequestObject(data,UserPermissionEdgeMapping);

        try {
            let response = await AuthApiService.post(url,data);

            return response.data;
        } catch (e) {
            throw new Error('Die Berechtigung konnte nicht zugewiesen werden.');
        }
    },

    //----------------------------------------------------

    editUserPermission: async (userId, id, data) => {
        let url = buildUrlPrefixUrl(userId,'self');

        url += '/'+id;

        data = formatToEdgeRequestObject(data,UserPermissionEdgeMapping);

        try {
            let response = await AuthApiService.post(url,data);

            return response.data;
        } catch (e) {
            throw new Error('Die Einstellungen für die Berechtigung konnten nicht vorgenommen werden.');
        }
    }
};

export default UserPermissionEdge;
export {
    UserPermissionEdgeMapping
}
