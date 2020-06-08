import ResourceApiService from "../api/resourceApi";

const UserService = {
    async setUserProperty(userId, property, value) {
        let ob = {};
        ob[property] = value;

        try {
            let response = await ResourceApiService.post(process.env.authApiUrl+'/users/'+userId, ob);
        } catch (e) {
            throw new Error('Das User Attribute '+ property + ' konnte nicht gesetzt werden.');
        }
    },
    async setUserProperties(userId, properties) {
        try {
            let response = await ResourceApiService.post(process.env.authApiUrl+'/users/'+userId, properties);
        } catch (e) {
            throw new Error(e.response.data.error.message);
        }
    }
};

export default UserService;
