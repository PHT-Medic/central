import {Context} from "@nuxt/types";
import {AbilityManager, OwnedPermission, Oauth2TokenResponse, Oauth2ClientProtocol} from "@typescript-auth/core";
import {scheduleJob, Job} from "node-schedule";

import {mapOnAllApis} from "~/modules/api";
import BaseApi from "~/modules/api/base";

import {AuthStoreToken} from "~/store/auth";


export type AuthModuleOptions = {
    tokenHost: string,
    tokenPath: string,
    userInfoPath: string
}

class AuthModule {
    protected ctx: Context;

    protected client: Oauth2ClientProtocol;

    protected refreshTokenJob: undefined | Job;

    protected storeKeys : string[] = [
        'token',
        'provider',
        'user',
        'permissions'
    ];

    protected abilityManager!: AbilityManager;

    protected identifyPromise : Promise<Record<string, any>> | undefined;

    // --------------------------------------------------------------------

    constructor(ctx: Context, options: AuthModuleOptions) {
        this.ctx = ctx;

        this.client = new Oauth2ClientProtocol({
            tokenHost: options.tokenHost,
            tokenPath: options.tokenPath,
            userInfoPath: options.userInfoPath,
            clientId: 'user-interface',
            // @ts-ignore
            authorizeRedirectURL: undefined
        })

        this.abilityManager = new AbilityManager([]);

        this.subscribeStore();
        this.initStore();
        this.initFromStore();
    }

    // --------------------------------------------------------------------

    private initFromStore() {
        const permissions = this.ctx.store.getters['auth/permissions'];
        this.setPermissions(permissions);
    }

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

        this.ctx.store.subscribe((mutation: any) => {
            switch(mutation.type) {
                case 'auth/setPermissions':
                    this.setPermissions(mutation.payload);
                    break;
                case 'auth/unsetPermissions':
                    this.setPermissions([]);
                    break;
                case 'auth/setToken':
                    let token = <AuthStoreToken> mutation.payload;
                    if(this.refreshTokenJob) {
                        this.refreshTokenJob.cancel();
                    }

                    let callback = () => {
                        if(typeof this.ctx !== 'undefined') {
                            this.ctx.store.dispatch('auth/triggerTokenExpired')
                                .then((r: any) => r)
                                .catch(() => this.ctx.redirect('/logout'));
                        }
                    };

                    callback.bind(this);

                    this.setRequestToken(token.accessToken);

                    if(typeof token.expireDate !== 'undefined') {
                        let expireDateInTime = (new Date(token.expireDate)).getTime();
                        let currentTime = (new Date()).getTime();

                        let timeoutMilliSeconds = expireDateInTime - currentTime;

                        if (timeoutMilliSeconds < 0) {
                            callback();
                        }

                        this.refreshTokenJob = scheduleJob(new Date(token.expireDate), callback);
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

    public resolveMe() : Promise<Record<string, any>|undefined> {
        if(typeof this.identifyPromise !== 'undefined') {
            return this.identifyPromise;
        }

        const token : AuthStoreToken | undefined = this.ctx.store.getters['auth/token'];
        if(!token) return new Promise(((resolve) => resolve(undefined)));

        const resolved = this.ctx.store.getters['auth/permissionsResolved'];
        if(typeof resolved !== 'undefined' && resolved) {
            const userInfo : Record<string, any> = {
                permissions: this.ctx.store.getters['auth/permissions'],
                ...this.ctx.store.getters['auth/user']
            };

            return new Promise(((resolve) => resolve(userInfo)));
        }

        this.identifyPromise = this.getUserInfo(token.accessToken)
            .then(this.handleUserInfoResponse.bind(this));

        return this.identifyPromise;
    };

    private async handleUserInfoResponse(userInfo: Record<string, any>) : Promise<Record<string, any>> {
        const {permissions, ...user} = userInfo;

        await this.ctx.store.commit('auth/setPermissionsResolved', true);
        await this.ctx.store.dispatch('auth/triggerSetUser', user);
        await this.ctx.store.dispatch('auth/triggerSetPermissions', permissions);

        return user;
    }

    // --------------------------------------------------------------------

    public can(action: string, subject: any, field?: string) {
        return this.abilityManager.can(action, subject, field);
    }

    public setPermissions(permissions: OwnedPermission<any>[]) {
        this.abilityManager.setPermissions(permissions);
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

    /**
     * Get access token with given credentials.
     *
     * @param username
     * @param password
     */
    public async getTokenWithPassword(username: string, password: string) : Promise<Oauth2TokenResponse> {
        const data = await this.client.getTokenWithPasswordGrant({
            username,
            password
        })

        this.setRequestToken(data.accessToken);

        return data;
    }

    /**
     * Refresh access token with a given refresh token.
     *
     * @param token
     */
    public async getTokenWithRefreshToken(token: string) : Promise<Oauth2TokenResponse> {
        const data = await this.client.getTokenWithRefreshToken({
            refresh_token: token
        });

        this.setRequestToken(data.accessToken);
        return data;
    }

    /**
     * Get user info for a given token.
     *
     * @param token
     */
    public async getUserInfo(token: string) {
        return await this.client.getUserInfo(token);
    }

}

export default AuthModule;
