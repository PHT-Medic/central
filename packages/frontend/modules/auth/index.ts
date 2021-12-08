/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import {
    APIType, detectProxyConnectionConfig, useAPI,
} from '@personalhealthtrain/ui-common';
import {
    AbilityManager,
    AbilityMeta,
    Oauth2Client,
    Oauth2TokenResponse,
    PermissionItem,
    buildAbilityMetaFromName,
} from '@typescript-auth/core';
import axios, { AxiosRequestConfig } from 'axios';
import { Store } from 'vuex';
import { AuthStoreToken } from '@/store/auth';

export type AuthModuleOptions = {
    tokenHost: string,
    tokenPath: string,
    userInfoPath: string
};

class AuthModule {
    protected ctx: Context;

    protected client: Oauth2Client;

    protected refreshTokenJob: undefined | ReturnType<typeof setTimeout>;

    protected responseInterceptorId : number | undefined;

    protected storeKeys : string[] = [
        'token',
        'provider',
        'user',
        'permissions',
    ];

    protected abilityManager!: AbilityManager;

    protected identifyPromise : Promise<Record<string, any>> | undefined;

    // --------------------------------------------------------------------

    constructor(ctx: Context, options: AuthModuleOptions) {
        this.ctx = ctx;

        const proxyConfig = detectProxyConnectionConfig();

        const httpClient : AxiosRequestConfig = {};

        if (
            process.server &&
            proxyConfig
        ) {
            httpClient.proxy = proxyConfig;
        }

        this.client = new Oauth2Client({
            token_host: options.tokenHost,
            token_path: options.tokenPath,
            user_info_path: options.userInfoPath,
            client_id: 'user-interface',
        }, httpClient);

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
        if (typeof this.ctx === 'undefined' || typeof this.ctx.store === 'undefined') return;

        for (let i = 0; i < this.storeKeys.length; i++) {
            const key = this.storeKeys[i];
            const keyWellFormed = key.charAt(0).toLocaleUpperCase() + key.slice(1);
            const commitName = `auth/set${keyWellFormed}`;

            const value = this.ctx.$authWarehouse.get(key);

            if (typeof value !== 'undefined') {
                (this.ctx.store as Store<any>).commit(commitName, value);
            }
        }
    }

    private subscribeStore() {
        if (typeof this.ctx === 'undefined') return;

        (this.ctx.store as Store<any>).subscribe((mutation: any) => {
            // eslint-disable-next-line default-case
            switch (mutation.type) {
                case 'auth/setPermissions':
                    this.setPermissions(mutation.payload);
                    break;
                case 'auth/unsetPermissions':
                    this.setPermissions([]);
                    break;
                case 'auth/setToken':
                    // eslint-disable-next-line no-case-declarations
                    const token = <AuthStoreToken> mutation.payload;
                    if (this.refreshTokenJob) {
                        clearTimeout(this.refreshTokenJob);
                    }

                    // eslint-disable-next-line no-case-declarations
                    const callback = () => {
                        if (typeof this.ctx !== 'undefined') {
                            this.ctx.store.dispatch('auth/triggerTokenExpired')
                                .then((r: any) => r)
                                .catch(() => this.ctx.redirect('/logout'));
                        }
                    };

                    callback.bind(this);

                    this.setRequestToken(token.access_token);

                    if (typeof token.expire_date !== 'undefined') {
                        const expireDateInTime = (new Date(token.expire_date)).getTime();
                        const currentTime = (new Date()).getTime();

                        const timeoutMilliSeconds = expireDateInTime - currentTime;

                        if (timeoutMilliSeconds < 0) {
                            callback();
                        }

                        this.refreshTokenJob = setTimeout(callback, timeoutMilliSeconds);
                    }
                    break;
                case 'auth/unsetToken':
                    if (this.refreshTokenJob) {
                        clearTimeout(this.refreshTokenJob);
                    }
                    break;
            }
        });
    }

    // --------------------------------------------------------------------

    public async resolveMe() : Promise<Record<string, any> | undefined> {
        if (typeof this.identifyPromise !== 'undefined') {
            return this.identifyPromise;
        }

        const token : AuthStoreToken | undefined = this.ctx.store.getters['auth/token'];
        if (!token) return Promise.resolve(undefined);

        const resolved = this.ctx.store.getters['auth/permissionsResolved'];
        if (typeof resolved !== 'undefined' && resolved) {
            const userInfo : Record<string, any> = {
                permissions: this.ctx.store.getters['auth/permissions'],
                ...this.ctx.store.getters['auth/user'],
            };

            return Promise.resolve(userInfo);
        }

        this.identifyPromise = this.getUserInfo(token.access_token)
            .then(this.handleUserInfoResponse.bind(this));

        return this.identifyPromise;
    }

    private async handleUserInfoResponse(userInfo: Record<string, any>) : Promise<Record<string, any>> {
        const { permissions, ...user } = userInfo;

        await this.ctx.store.commit('auth/setPermissionsResolved', true);
        await this.ctx.store.dispatch('auth/triggerSetUser', user);
        await this.ctx.store.dispatch('auth/triggerSetPermissions', permissions);

        return user;
    }

    // --------------------------------------------------------------------

    public can(action: string, subject: any, field?: string) {
        return this.abilityManager.can(action, subject, field);
    }

    public hasAbility(ability: AbilityMeta) : boolean {
        return this.abilityManager.can(ability.action, ability.subject);
    }

    public hasPermission(name: string) : boolean {
        const ability = buildAbilityMetaFromName(name);
        return this.hasAbility(ability);
    }

    public setPermissions(permissions: PermissionItem<any>[]) {
        this.abilityManager.setPermissions(permissions);
    }

    // --------------------------------------------------------------------

    public setRequestToken(token: string) {
        useAPI(APIType.DEFAULT).setAuthorizationHeader({
            type: 'Bearer',
            token,
        });

        this.responseInterceptorId = useAPI(APIType.DEFAULT)
            .mountResponseInterceptor((data) => data, (error: any) => {
                if (typeof this.ctx === 'undefined') return;

                if (typeof error !== 'undefined' && error && typeof error.response !== 'undefined') {
                    if (error.response.status === 401) {
                        // Refresh the access accessToken
                        try {
                            this.ctx.store.dispatch('auth/triggerRefreshToken').then(() => axios({
                                method: error.config.method,
                                url: error.config.url,
                                data: error.config.data,
                            }));
                        } catch (e) {
                            // this.ctx.store.dispatch('triggerSetLoginRequired', true).then(r => r);
                            this.ctx.redirect('/logout');

                            throw error;
                        }
                    }

                    throw error;
                }
            });
    }

    public unsetRequestToken = () => {
        if (this.responseInterceptorId) {
            useAPI(APIType.DEFAULT).unmountRequestInterceptor(this.responseInterceptorId);
            this.responseInterceptorId = undefined;
        }

        useAPI(APIType.DEFAULT).unsetAuthorizationHeader();
    };

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
            password,
        });

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
            refresh_token: token,
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
        return this.client.getUserInfo(token);
    }
}

export default AuthModule;
