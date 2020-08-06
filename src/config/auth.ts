import {randomBytes} from "crypto";

const LAPOauth2 = 'lapOauth2';
const LAPBasic = 'lapBasic';

const AuthLAPMode = {
    LAPOauth2,
    LAPBasic
}

export {
    AuthLAPMode,
    LAPOauth2,
    LAPBasic
}

const JWTKeyTypePrivateKey = 'privateKey';
const JWTKeyTypeSecret = 'secret';

const JWTKeyType = {
    JWTKeyTypePrivateKey,
    JWTKeyTypeSecret
};

export {
    JWTKeyType,
    JWTKeyTypeSecret,
    JWTKeyTypePrivateKey
}

const AuthConfig: any = {
    lapMode: AuthLAPMode.LAPBasic,
    lap: {
        jwtMaxAge: process.env.JWT_MAX_AGE ?? 3600 * 24 * 31,
        jwtKey: process.env.JWT_KEY ?? randomBytes(10).toString('hex'),
        jwtKeyType: process.env.JWT_KEY_TYPE ?? JWTKeyTypeSecret,
        oauth2: {
            defaultClientId: null,
            defaultClientSecret: null,
            url: 'token'
        }
    },

    tpap: {
        ldap: {
            url: 'ldap'
        },
    },

    /**
     * Users created on 'npm run run-seed'.
     */
    users: [
        {name: 'admin', password: 'start123', email: 'peter.placzek1996@gmail.com'},
    ],
    /**
     * Permissions created on 'npm run run-seed'.
     */
    permissions: [
        {name: 'admin_ui_use'},

        {name: 'permission_add'},
        {name: 'permission_drop'},
        {name: 'permission_edit'},

        {name: 'user_add'},
        {name: 'user_drop'},
        {name: 'user_edit'},

        {name: 'user_permission_add'},
        {name: 'user_permission_drop'},
    ]
}

export default AuthConfig;
