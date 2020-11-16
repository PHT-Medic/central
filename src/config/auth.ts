import env from "../env";

export type JwtProcedure = 'RSA' | 'HMAC';
export type LapMode = 'lapOauth2' | 'lapBasic';

interface AuthConfigInterface {
    lapMode: LapMode,
    lap: {
        jwtMaxAge: number,
        jwtSecret: string,
        jwtPrivateKey: string | undefined,
        jwtPublicKey: string | undefined,
        jwtProcedure: JwtProcedure,
        oauth2: {
            defaultClientId: string | undefined,
            defaultClientSecret: string | undefined,
            url: string | undefined
        } | undefined
    },
    [key: string]: any
}

const AuthConfig: AuthConfigInterface = {
    lapMode: 'lapBasic',
    lap: {
        jwtMaxAge: 3600 * 24 * 31,
        jwtSecret: env.jwtSecret,
        jwtPrivateKey: env.jwtPrivateKey,
        jwtPublicKey: env.jwtPublicKey,
        jwtProcedure: <JwtProcedure> env.jwtProcedure,
        oauth2: {
            defaultClientId: undefined,
            defaultClientSecret: undefined,
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

        {name: 'role_add'},
        {name: 'role_drop'},
        {name: 'role_edit'},

        {name: 'role_permission_add'},
        {name: 'role_permission_drop'}
    ]
}

export default AuthConfig;
