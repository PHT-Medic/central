const AuthModeOauth2 = 'oauth2Authentication';
const AuthModeToken = 'tokenAuthentication';

const AuthModes = {
    AuthModeOauth2,
    AuthModeToken
}

export {
    AuthModeToken,
    AuthModeOauth2,
    AuthModes
}

const AuthConfig = {
    baseUrl: 'http://localhost:3002/',

    selfUrl: 'me',

    lapMode: AuthModeToken,
    lap: {
        token: {
            url: 'token'
        },
        oauth2: {
            clientId: 'pht',
            clientSecret: null,
            url: 'token'
        }
    },

    tpap: {
        ldap: {
            url: 'ldap'
        },
    }
};

export default AuthConfig;
