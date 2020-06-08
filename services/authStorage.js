import StorageService from "./storage";

const accessTokenKey = 'accessToken';

const userKey = 'user';
const permissionsKey = 'permissions';
const abilitiesKey = 'abilities';

const AuthStorage = {
    // Access Token operations

    getToken () {
        return StorageService.get(accessTokenKey);
    },
    setToken (data) {
        StorageService.set(accessTokenKey, data);
    },
    dropToken () {
        StorageService.drop(accessTokenKey);
    },

    // User operations

    getUser () {
        StorageService.getJson(userKey);
    },
    setUser (data) {
        StorageService.setJson(userKey,data);
    },
    dropUser () {
        StorageService.dropJson(userKey);
    },

    // User permissions operations

    getPermissions () {
        let permissions = StorageService.getJson(permissionsKey);

        return permissions ? permissions : [];
    },
    setPermissions (data) {
        if (!Array.isArray(data)) { return }

        StorageService.setJson(permissionsKey,data);
    },
    dropPermissions () {
        StorageService.dropJson(permissionsKey);
    },

    getAbilities () {
        let data = StorageService.getJson(abilitiesKey);

        return data ? data : [];
    },
    setAbilities (data) {
        if (!Array.isArray(data)) { return }

        StorageService.setJson(abilitiesKey,data);
    },
    dropAbilities () {
        StorageService.dropJson(abilitiesKey);
    }
}

export { AuthStorage }
export default AuthStorage;
