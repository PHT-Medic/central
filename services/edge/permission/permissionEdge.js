import AuthApiService from "../../api/authApi";
import {parseEdgeResponseObject} from "../helpers/edgeHelpers";

//----------------------------------------------------

const PermissionEdgeMapping = {
    id: 'id',
    name: 'name',
    namePretty: 'name_pretty',
    title: 'title',
    description: 'description',
    powerConfigurable: 'power_configurable',
    powerInverseConfigurable: 'power_inverse_configurable',
    scopeConfigurable: 'scope_configurable',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
}

//----------------------------------------------------

const PermissionEdge = {
    getPermissions: async() => {
        try {
            let response = await AuthApiService.get('permissions');

            let data = response.data;

            data = data.map((item) => {
                return parseEdgeResponseObject(item, PermissionEdgeMapping);
            });

            return data;
        } catch (e) {
            throw new Error('Die Berechtigungen konnten nicht geladen werden.');
        }
    }
};

export default PermissionEdge;

export {
    PermissionEdgeMapping
}
