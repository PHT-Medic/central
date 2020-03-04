const accessTokenKey = 'accessToken';
const userKey = 'user';

const AuthStorage = {
    // Access Token operations

    getToken() {
        return localStorage.getItem(accessTokenKey);
    },
    setToken(token) {
        localStorage.setItem(accessTokenKey,token);
    },
    dropToken() {
        localStorage.removeItem(accessTokenKey);
    },

    // User operations

    getUser() {
        let user = localStorage.getItem(userKey);
        if(user !== null) {
            return JSON.parse(user);
        }

        return null;
    },
    setUser(user) {
        user = JSON.stringify(user);
        localStorage.setItem(userKey,user);
    },
    dropUser() {
        localStorage.removeItem(userKey);
    },
}

export { AuthStorage };