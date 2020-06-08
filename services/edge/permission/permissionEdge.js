import AuthApiService from "../../api/authApi";

const PermissionEdge = {
    getPermissions: async() => {
        try {
            let response = await AuthApiService.get('permissions');

            return response.data;
        } catch (e) {
            throw new Error('Die Berechtigungen konnten nicht geladen werden.');
        }
    }
};

export default PermissionEdge;
