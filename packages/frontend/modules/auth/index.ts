/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Context} from "@nuxt/types";
import {Store} from 'vuex';
import {AbilityManager, OwnedPermission, Oauth2TokenResponse, Oauth2Client} from "@typescript-auth/core";

import {mapOnAllApis} from "~/modules/api";
import BaseApi from "~/modules/api/base";

import {AuthStoreToken} from "~/store/auth";
import {changeResponseKeyCase} from "~/modules/api/utils";


export type AuthModuleOptions = {
    tokenHost: string,
    tokenPath: string,
    userInfoPath: string
}

class AuthModule {
    protected ctx: Context;

    protected client: Oauth2Client;

    protected refreshTokenJob: undefined | ReturnType<typeof setTimeout>;

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

        this.client = new Oauth2Client({
            token_host: options.tokenHost,
            token_path: options.tokenPath,
            user_info_path: options.userInfoPath,
            client_id: 'user-interface'
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
                (this.ctx.store as Store<any>).commit(commitName, value);
            }
        }
    }

    private subscribeStore() {
        if(typeof this.ctx === 'undefined') return;

        (this.ctx.store as Store<any>).subscribe((mutation: any) => {
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
                        clearTimeout(this.refreshTokenJob);
                    }

                    let callback = () => {
                        if(typeof this.ctx !== 'undefined') {
                            this.ctx.store.dispatch('auth/triggerTokenExpired')
                                .then((r: any) => r)
                                .catch(() => this.ctx.redirect('/logout'));
                        }
                    };

                    callback.bind(this);

                    this.setRequestToken(token.access_token);

                    if(typeof token.expire_date !== 'undefined') {
                        let expireDateInTime = (new Date(token.expire_date)).getTime();
                        let currentTime = (new Date()).getTime();

                        let timeoutMilliSeconds = expireDateInTime - currentTime;

                        if (timeoutMilliSeconds < 0) {
                            callback();
                        }

                        this.refreshTokenJob = setTimeout(callback, timeoutMilliSeconds);
                    }
                    break;
                case 'auth/unsetToken':
                    if(this.refreshTokenJob) {
                        clearTimeout(this.refreshTokenJob);
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

        this.identifyPromise = this.getUserInfo(token.access_token)
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

        this.setRequestToken(data.access_token);

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

        this.setRequestToken(data.access_token);
        return data;
    }

    /**
     * Get user info for a given token.
     *
     * @param token
     */
    public async getUserInfo(token: string) : Promise<Record<string, any>> {
        const data = await this.client.getUserInfo(token);

        // change key case, because all user objects are in that format.
        return changeResponseKeyCase(data);
    }

}

export default AuthModule;
