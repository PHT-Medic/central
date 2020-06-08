import AuthApiService from "../../api/authApi";

const UserEdge = {
    getUsers: async() => {
        try {
            let response = await AuthApiService.get('users');

            return response.data;
        } catch (e) {
            throw new Error('Die Benutzer konnten nicht geladen werden.');
        }
    },
    getUser: async(id) => {
        try {
            let response = await AuthApiService.get('users/'+id);

            return response.data;
        } catch (e) {
            throw new Error('Die Benutzer mit der ID ' + id + ' konnte nicht gefunden werden.');
        }
    },
    dropUser: async(id) => {
        try {
            let response = await AuthApiService.delete('users/'+id);

            return response.data;
        } catch (e) {
            throw new Error('Die Benutzer mit der ID ' + id + ' konnte nicht gelöscht werden.');
        }
    },

    addUser: async (data) => {
        try {
            let response = await AuthApiService.post('users',data);

            return response.data;
        } catch (e) {
            throw new Error('Die Benutzer konnte nicht erstellt werden.');
        }
    }
};

export default UserEdge;
