import {ApiType} from "~/modules/api";

//---------------------------------------------------------------------------------

export type AuthSchemeJWT = 'JWT';
export type AuthSchemeOauth2 = 'Oauth2';
export type AuthScheme = AuthSchemeJWT | AuthSchemeOauth2;

export interface AuthSchemeInterface {
    setOptions(config: AuthSchemeOptions) : any;
    getOptions() : AuthSchemeOptions;

    attemptToken(data: any) : Promise<AuthAbstractTokenResponse>;

    getUserInfo(): Promise<AuthAbstractUserInfoResponse>;
}

export interface AuthSchemeOptionsInterface {
    scheme: AuthScheme
}

// JWT
export interface AuthSchemeJWTOptionsInterface {
    scheme: AuthSchemeJWT,
    endpoints: {
        api: ApiType,
        token: string,
        userInfo: string
    }
}

// Oauth2
export type AuthSchemeOauth2GrantType = 'password' | 'refresh_token';
export interface AuthSchemeOauth2OptionsInterface extends AuthSchemeOptionsInterface {
    scheme: AuthSchemeOauth2,
    clientId: string,
    clientSecret?: undefined | string,
    grantType: AuthSchemeOauth2GrantType,
    endpoints: {
        api: ApiType,
        token: string,
        userInfo: string,
        authorization?: string,
    }
}

export type AuthSchemeOptions = AuthSchemeJWTOptionsInterface | AuthSchemeOauth2OptionsInterface;

//---------------------------------------------------------------------------------

export interface AuthAbstractTokenResponse {
    accessToken: string,
    refreshToken?: string,
    meta: {
        expiresIn: number,
        expireDate: string
    },
    [key: string]: any
}

export interface AuthAbstractUserInfoResponse {
    id: number,
    name: string,
    avatar?: string,
    email?: string,
    permissions?: any,
    [key: string]: any
}

export interface AuthAbilityOption {
    power: number | null,
    fields: string[]
}
