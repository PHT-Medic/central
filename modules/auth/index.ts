import {Ability, AbilityBuilder} from "@casl/ability";

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
    protected ctx: Context;

    protected refreshTokenJob: undefined | Job;

    protected storeKeys : string[] = [
        'token',
        'provider',
        'user',
        'permissions'
    ];

    protected ability: Ability;
    protected abilityOptions : WeakMap<object, AuthAbilityOption>;

    public me : AuthAbstractUserInfoResponse | undefined;
    protected mePromise : Promise<AuthAbstractUserInfoResponse> | undefined;

    // --------------------------------------------------------------------

    constructor(ctx: Context) {
        this.ctx = ctx;

        this.ability = new Ability();
        this.abilityOptions = new WeakMap<object, AuthAbilityOption>();

        this.subscribeStore();
        this.initStore();
    }

    // --------------------------------------------------------------------

    private initStore() {
        if(typeof this.ctx === 'undefined' || typeof this.ctx.store === 'undefined') return;

        for(let i=0; i<this.storeKeys.length; i++) {
            const key = this.storeKeys[i];
            const keyWellFormed = key.charAt(0).toLocaleUpperCase() + key.slice(1);
            const commitName = 'auth/set' +  keyWellFormed;

            const value = this.ctx.$authWarehouse.get(key);

            if(typeof value !== 'undefined') {
                this.ctx.store.commit(commitName, value);
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

                    let callback = () => {
                        if(typeof this.ctx !== 'undefined') {
                            this.ctx.store.dispatch('auth/triggerTokenExpired')
                                .then((r: any) => r)
                                .catch(e => this.ctx.redirect('/logout'));
                        }
                    };

                    callback.bind(this);

                    this.setRequestToken(token.accessToken);

                    if(typeof token.meta !== 'undefined') {
                        let {expireDate} = token.meta;

                        let expireDateInTime = (new Date(expireDate)).getTime();
                        let currentTime = (new Date()).getTime();

                        let timeoutMilliSeconds = expireDateInTime - currentTime;

                        console.log(timeoutMilliSeconds);

                        if (timeoutMilliSeconds < 0) {
                            callback();
                        }

                        this.refreshTokenJob = scheduleJob(new Date(expireDate), callback);
                    }
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

    public resolveMe() : Promise<AuthAbstractUserInfoResponse|undefined> {
        if(typeof this.mePromise !== 'undefined') {
            return this.mePromise;
        }

        if(typeof this.me !== 'undefined') {
            return new Promise(((resolve) => resolve(this.me)));
        }

        const token : AuthAbstractTokenResponse | undefined = this.ctx.store.getters['auth/token'];
        if(!token) return new Promise(((resolve) => resolve(undefined)));

        this.mePromise = this.getUserInfo(token.accessToken)
            .then((userInfoResponse: AuthAbstractUserInfoResponse) => {
                this.me = userInfoResponse;

                this.handleUserInfoResponse(userInfoResponse);

                return userInfoResponse;
            });

        return this.mePromise;
    };

    private handleUserInfoResponse(userInfo: AuthAbstractUserInfoResponse) {
        if(typeof this.ctx === 'undefined') {
            return;
        }

        const {permissions, ...user} = userInfo;

        this.ctx.store.dispatch('auth/triggerSetUser', user).then(r => r);
        this.ctx.store.dispatch('auth/triggerSetPermissions', permissions).then(r => r);
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

    public async attemptAccessTokenWith(data: any) : Promise<AuthAbstractTokenResponse> {
        let provider = useAuthScheme('local');
        let tokenResponse : AuthAbstractTokenResponse;

        switch (provider.getOptions().scheme) {
            case "Oauth2":
                data = {
                    ...data,
                    grant_type: (<AuthSchemeOauth2OptionsInterface> provider.getOptions()).grantType
                };

                tokenResponse = await provider.attemptToken(data);
            default:
                tokenResponse = await provider.attemptToken(data);
                break;

        }

        this.setRequestToken(tokenResponse.accessToken);

        return tokenResponse;
    }

    public async attemptRefreshTokenWith(token: string) : Promise<AuthAbstractTokenResponse> {
        let provider = useAuthScheme('local');
        let tokenResponse : AuthAbstractTokenResponse | undefined;

        switch (provider.getOptions().scheme) {
            case "Oauth2":
                let data = {
                    refresh_token: token,
                    grant_type: 'refresh_token'
                };

                tokenResponse = await provider.attemptToken(data);
                break;
            default:
                throw new Error('Refresh Access with refreshToken is not supported by the provider.');

        }

        this.setRequestToken(tokenResponse.accessToken);
        return tokenResponse;
    }

    // --------------------------------------------------------------------

    public async getUserInfo(token: string) {
        return await useAuthScheme('local').getUserInfo(token);
    }

}

export default AuthModule;

export { AuthenticationError }
