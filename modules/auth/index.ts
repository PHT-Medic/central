import {Ability, AbilityBuilder} from "@casl/ability";

import { camelCase } from 'change-case';

import {scheduleJob, Job} from "node-schedule";

import {mapOnAllApis} from "~/modules/api";
import BaseApi from "~/modules/api/base";

import {AuthAbilityOption, AuthAbstractTokenResponse, AuthAbstractUserInfoResponse} from "~/modules/auth/types";
import {AuthSchemeOauth2OptionsInterface} from "~/modules/auth/types";
import {Context} from "@nuxt/types";
import {useAuthScheme} from "~/modules/auth/schemes";
import {AbilityRepresentation, parsePermissionNameToAbilityRepresentation} from "~/modules/auth/utils";


// --------------------------------------------------------------------

class AuthenticationError extends Error {
    public errorCode: string;

    constructor (errorCode: string, message: string) {
        super(message);

        this.name = this.constructor.name;
        this.message = message;
        this.errorCode = errorCode;
    };
}

// --------------------------------------------------------------------
class AuthModule {
    protected ctx: Context | undefined;

    protected refreshTokenJob: undefined | Job;

    protected storeKeys : string[] = [
        'token',
        'provider',
        'user',
        'permissions'
    ];

    protected ability: Ability;
    protected abilityOptions : WeakMap<object, AuthAbilityOption>;

    protected mePromise : Promise<AuthAbstractUserInfoResponse> | undefined;

    // --------------------------------------------------------------------

    constructor(ctx?: Context) {
        this.ability = new Ability();
        this.abilityOptions = new WeakMap<object, AuthAbilityOption>();

        if(typeof ctx !== 'undefined') {
            this.registerContext(ctx);

            this.subscribeStore();
            this.initStore();
        }
    }

    // --------------------------------------------------------------------

    public registerContext(ctx: Context) {
        this.ctx = ctx;
    }

    // --------------------------------------------------------------------

    private initStore() {
        if(typeof this.ctx === 'undefined' || typeof this.ctx.store === 'undefined') return;

        for(let i=0; i<this.storeKeys.length; i++) {
            const key = this.storeKeys[i];
            const keyWellFormed = key.charAt(0).toLocaleUpperCase() + key.slice(1);
            const commitName = 'auth/set' +  keyWellFormed;
            const actionName = 'auth/triggerSet' + keyWellFormed;

            const value = this.ctx.$authWarehouse.get(key);

            switch (key) {
                case 'permissions':
                    if(typeof value === 'undefined') {
                        const token = this.ctx.store.getters['auth/token'];
                        const provider = this.ctx.store.getters['auth/provider'];

                        if(token && provider) {
                            this.getUserInfo(provider).then((user: AuthAbstractUserInfoResponse) => {
                                if(typeof this.ctx === 'undefined' || typeof this.ctx.store === 'undefined') return;

                                this.ctx.store.dispatch(actionName, user.permissions).then(r => r);
                            }).catch(e => console.log(e));
                        }
                    } else {
                        this.ctx.store.commit(commitName, value);
                    }
                    break;
                default:
                    if(typeof value !== 'undefined') {
                        this.ctx.store.commit(commitName, value);
                    }
                    break;
            }
        }
    }

    private subscribeStore() {
        if(typeof this.ctx === 'undefined') return;

        this.ctx.store.subscribe((mutation: any, state: any) => {
            switch(mutation.type) {
                case 'auth/setPermissions':
                    this.setPermissions(mutation.payload);
                    break;
                case 'auth/unsetPermissions':
                    this.setPermissions([]);
                    break;
                case 'auth/setToken':
                    let token = <AuthAbstractTokenResponse> mutation.payload;
                    if(this.refreshTokenJob) {
                        this.refreshTokenJob.cancel();
                    }

                    let { expireDate } = token.meta;

                    let callback = () => {
                        if(typeof this.ctx !== 'undefined') {
                            try {
                                this.ctx.store.dispatch('auth/triggerTokenExpired').then((r: any) => r);
                            } catch (e) {
                                this.ctx.redirect('/logout');
                            }
                        }
                    };

                    callback.bind(this);

                    let expireDateInTime = (new Date(expireDate)).getTime();
                    let currentTime = (new Date()).getTime();

                    let timeoutMilliSeconds = expireDateInTime - currentTime;

                    if(timeoutMilliSeconds < 0) {
                        callback();
                    }

                    this.setRequestToken(token.accessToken);

                    this.refreshTokenJob = scheduleJob(new Date(expireDate), callback);
                    break;
                case 'auth/unsetToken':
                    if(this.refreshTokenJob) {
                        this.refreshTokenJob.cancel();
                    }
                    break;
            }
        })
    }

    // --------------------------------------------------------------------

    public resolveMe() : Promise<AuthAbstractUserInfoResponse> {
        if(typeof this.mePromise !== 'undefined') {
            return this.mePromise;
        }

        if(typeof this.ctx === 'undefined') return new Promise<any>(((resolve) => resolve()));

        const token = this.ctx.store.getters['auth/token'];
        const provider = this.ctx.store.getters['auth/provider'];

        if(!token || !provider) return new Promise<any>(((resolve) => resolve()));

        this.mePromise = this.getUserInfo(provider).then((userInfoResponse: AuthAbstractUserInfoResponse) => {
            if(typeof this.ctx === 'undefined') return new Promise<any>(((resolve) => resolve()));

            const {permissions, ...user} = userInfoResponse;

            this.ctx.store.dispatch('auth/triggerSetUser', user).then(r => r);
            this.ctx.store.dispatch('auth/triggerSetPermissions', permissions).then(r => r);

            return userInfoResponse;
        });

        return this.mePromise;
    }

    // --------------------------------------------------------------------

    public can(...args: any) {
        // @ts-ignore
        return this.ability.can(...args);
    }

    public setPermissions(permissions: {name: string, scopes: any}[]) {
        if(permissions.length === 0) {
            this.ability.update([]);
            return;
        }

        let { can, rules } = new AbilityBuilder();

        for(let i=0; i<permissions.length; i++) {
            let { name, scopes } : {name: string, scopes: any} = permissions[i];

            const ability : AbilityRepresentation = parsePermissionNameToAbilityRepresentation(name);

            if(typeof scopes !== 'undefined' && scopes !== null) {
                for (let j = 0; j < scopes.length; j++) {
                    let {power, fields, condition}: {
                        power?: number | null,
                        fields?: string[] | null,
                        condition?: any
                    } = scopes[j];

                    if (condition === null) {
                        condition = undefined;
                    }

                    if (fields === null) {
                        fields = undefined;
                    }

                    can(ability.action, ability.subject, condition);
                }
            } else {
                can(ability.action, ability.subject);
            }
        }

        // @ts-ignore
        this.ability.update(rules);
    }

    // --------------------------------------------------------------------

    public setRequestToken = (token: string) => {
        mapOnAllApis((api: BaseApi) => {
            api.setAuthorizationBearerHeader(token);
            api.mountAuthResponseInterceptor();

            return api;
        });
    };

    public unsetRequestToken = () => {
        mapOnAllApis((api: BaseApi) => {
            api.unsetAuthorizationBearerHeader();
            api.unMountAuthResponseInterceptor();
            return api;
        });
    }

    // --------------------------------------------------------------------

    public async attemptAccessTokenWith(name: string, data: any) : Promise<AuthAbstractTokenResponse> {
        let provider = useAuthScheme(name);
        let tokenResponse : AuthAbstractTokenResponse;

        switch (provider.getOptions().scheme) {
            case "JWT":
                tokenResponse = await provider.attemptToken(data);
                break;
            case "Oauth2":
                data = {
                    ...data,
                    grant_type: (<AuthSchemeOauth2OptionsInterface> provider.getOptions()).grantType
                };

                tokenResponse = await provider.attemptToken(data);

        }

        this.setRequestToken(tokenResponse.accessToken);

        return tokenResponse;
    }

    public async attemptRefreshTokenWith(name: string, token: string) : Promise<AuthAbstractTokenResponse> {
        let provider = useAuthScheme(name);
        let tokenResponse : AuthAbstractTokenResponse;

        switch (provider.getOptions().scheme) {
            case "JWT":
                throw new Error('Refresh Access with refreshToken is not supported by the provider.');
            case "Oauth2":
                let data = {
                    refresh_token: token,
                    grant_type: 'refresh_token'
                };

                tokenResponse = await provider.attemptToken(data);
        }

        this.setRequestToken(tokenResponse.accessToken);
        return tokenResponse;
    }

    // --------------------------------------------------------------------

    public async getUserInfo(name: string) {
        return await useAuthScheme(name).getUserInfo();
    }

}

export default AuthModule;

export { AuthenticationError }
