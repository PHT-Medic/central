import AuthApiService from '../../services/api/authApi';

export async function getRoles() {
    try {
        let response = await AuthApiService.get('roles');

        return response.data;
    } catch (e) {
        throw new Error('Die Rollen konnten nicht geladen werden.');
    }
}

export async function getRole(roleId) {
    try {
        let response = await AuthApiService.get('roles/'+roleId);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht geladen werden.');
    }
}

export async function dropRole(roleId) {
    try {
        let response = await AuthApiService.delete('roles/'+roleId);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht gelöscht werden.');
    }
}

export async function addRole(data) {
    try {
        let response = await AuthApiService.post('roles', data);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht erstellt werden.');
    }
}

export async function editRole(id, data) {
    try {
        let response = await AuthApiService.post('roles/'+id, data);

        return response.data;
    } catch (e) {
        throw new Error('Die Rolle konnte nicht erstellt werden.');
    }
}
