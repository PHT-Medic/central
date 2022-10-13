/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import https from 'https';
import {
    AbilityManager,
    OAuth2SubKind,
    OAuth2TokenGrantResponse,
    OAuth2TokenIntrospectionResponse,
    OAuth2TokenKind,
    User,
} from '@authelion/common';
import { Config, createClient } from 'hapic';
import { Client, ClientOptions } from '@hapic/oauth2';
import { AuthBrowserStorageKey } from './constants';

export class AuthModule {
    protected ctx: Context;

    public client: Client;

    protected refreshTokenJob: undefined | ReturnType<typeof setTimeout>;

    protected responseInterceptorId : number | undefined;

    protected authResponseInterceptorId : number | undefined;

    protected abilityManager!: AbilityManager;

    protected resolvePromise : Promise<void> | undefined;

    // --------------------------------------------------------------------

    constructor(ctx: Context, options: ClientOptions) {
        this.ctx = ctx;

        const config : Config = {
            driver: {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            },
        };

        if (
            process.server &&
            config.driver
        ) {
            config.driver.proxy = false;
        }

        this.client = new Client({
            ...config,
            options,
        });

        this.client.mountResponseInterceptor((r) => r, ((error) => {
            if (typeof error?.response?.data?.message === 'string') {
                error.message = error.response.data.message;
                throw error;
            }

            throw new Error('A network error occurred.');
        }));

        this.abilityManager = new AbilityManager([]);

        this.subscribeStore();
        this.initStore();
        this.initFromStore();
    }

    // --------------------------------------------------------------------

    private initFromStore() {
        const permissions = this.ctx.store.getters['auth/permissions'];
        this.abilityManager.set(permissions);
    }

    private initStore() {
        if (typeof this.ctx === 'undefined' || typeof this.ctx.store === 'undefined') return;

        const values = Object.values(AuthBrowserStorageKey);
        for (let i = 0; i < values.length; i++) {
            const value = this.ctx.$authWarehouse.get(values[i]);
            if (!value) {
                continue;
            }

            switch (values[i]) {
                case AuthBrowserStorageKey.ACCESS_TOKEN:
                    this.ctx.store.commit('auth/setToken', {
                        kind: OAuth2TokenKind.ACCESS,
                        token: value,
                    });
                    break;
                case AuthBrowserStorageKey.ACCESS_TOKEN_EXPIRE_DATE:
                    this.ctx.store.commit('auth/setTokenExpireDate', {
                        kind: OAuth2TokenKind.ACCESS,
                        date: new Date(value),
                    });
                    break;
                case AuthBrowserStorageKey.REFRESH_TOKEN:
                    this.ctx.store.commit('auth/setToken', {
                        kind: OAuth2TokenKind.REFRESH,
                        token: value,
                    });
                    break;
                case AuthBrowserStorageKey.PERMISSIONS:
                    this.ctx.store.commit('auth/setPermissions', value);
                    break;
                case AuthBrowserStorageKey.USER:
                    this.ctx.store.commit('auth/setUser', value);
                    break;
            }
        }
    }

    private subscribeStore() {
        if (typeof this.ctx === 'undefined') return;

        this.ctx.store.subscribe((mutation) => {
            switch (mutation.type) {
                case 'auth/setPermissions':
                    this.abilityManager.set(mutation.payload);
                    break;
                case 'auth/unsetPermissions':
                    this.abilityManager.set([]);
                    break;
                case 'auth/setToken': {
                    const { kind, token }: { kind: OAuth2TokenKind, token: string } = mutation.payload;
                    if (kind === OAuth2TokenKind.ACCESS) {
                        this.setRequestToken(token);
                    }
                    break;
                }
                case 'auth/setTokenExpireDate': {
                    // eslint-disable-next-line no-case-declarations
                    const { kind, date } : {kind: OAuth2TokenKind, date: Date} = mutation.payload;
                    if (kind !== OAuth2TokenKind.ACCESS) {
                        return;
                    }

                    if (this.refreshTokenJob) {
                        clearTimeout(this.refreshTokenJob);
                    }

                    const callback = () => {
                        if (
                            typeof this.ctx === 'undefined' ||
                            this.ctx.route.path.startsWith('/logout') ||
                            this.ctx.route.path.startsWith('/login')
                        ) return;

                        this.ctx.store.dispatch('auth/triggerRefreshToken')
                            .catch(() => {
                                this.ctx.redirect({
                                    path: '/logout',
                                    query: { redirect: this.ctx.route.fullPath },
                                });
                            });
                    };

                    callback.bind(this);

                    if (date instanceof Date) {
                        const timeoutMilliSeconds = date.getTime() - Date.now() - 30.000;

                        if (timeoutMilliSeconds < 0) {
                            callback();
                        }

                        this.refreshTokenJob = setTimeout(callback, timeoutMilliSeconds);
                    }
                    break;
                }
                case 'auth/unsetToken': {
                    if (this.refreshTokenJob) {
                        clearTimeout(this.refreshTokenJob);
                    }
                    break;
                }
            }
        });
    }

    // --------------------------------------------------------------------

    isLoggedIn() : boolean {
        return this.ctx.store.getters['auth/loggedIn'];
    }

    public async resolve() : Promise<void> {
        if (typeof this.resolvePromise !== 'undefined') {
            return this.resolvePromise;
        }

        const token = this.ctx.store.getters['auth/accessToken'];
        if (!token) return Promise.resolve();

        const resolved = this.ctx.store.getters['auth/resolved'];
        if (resolved) {
            return Promise.resolve();
        }

        this.setRequestToken(token);

        const tokenPromise = new Promise<void>((resolve, reject) => {
            this.client.token.introspect<OAuth2TokenIntrospectionResponse>(token)
                .then(async (token) => {
                    await this.ctx.store.dispatch('auth/triggerSetPermissions', token.permissions);

                    if (token.sub_kind === OAuth2SubKind.USER) {
                        resolve();
                    } else {
                        reject(new Error('Only user access permitted.'));
                    }
                })
                .catch((e) => reject(e));
        });

        const identityPromise = new Promise<void>((resolve, reject) => {
            if (this.ctx.store.getters['auth/user']) {
                resolve();
            } else {
                this.client.userInfo.get<User>(token)
                    .then(async (entity) => {
                        await this.ctx.store.dispatch('auth/triggerSetPermissions', token.permissions);

                        await this.ctx.store.dispatch('auth/triggerSetUser', entity);
                        await this.ctx.store.commit('auth/setResolved', true);
                        resolve();
                    })
                    .catch((e) => reject(e));
            }
        });

        this.resolvePromise = new Promise<void>((resolve, reject) => {
            Promise.all([tokenPromise, identityPromise])
                .then(() => resolve())
                .catch((e) => {
                    this.unsetRequestToken();
                    reject(e);
                });
        });

        return this.resolvePromise;
    }

    // --------------------------------------------------------------------

    public has(name: string) : boolean {
        return this.abilityManager.has(name);
    }

    // --------------------------------------------------------------------

    public setRequestToken(token: string) {
        this.ctx.$api.setAuthorizationHeader({
            type: 'Bearer',
            token,
        });

        this.ctx.$authApi.setAuthorizationHeader({
            type: 'Bearer',
            token,
        });

        const interceptor = (error: any) => {
            if (
                error &&
                error.response &&
                error.response.status === 401
            ) {
                // Refresh the access accessToken
                try {
                    return Promise.resolve()
                        .then(() => this.ctx.store.dispatch('auth/triggerRefreshToken'))
                        .then(() => createClient().request({
                            method: error.config.method,
                            url: error.config.url,
                            data: error.config.data,
                        }));
                } catch (e) {
                    this.ctx.redirect('/logout');
                }
            }

            return Promise.reject(error);
        };

        this.responseInterceptorId = this.ctx.$api
            .mountResponseInterceptor((data) => data, interceptor);

        this.authResponseInterceptorId = this.ctx.$authApi
            .mountResponseInterceptor((data) => data, interceptor);
    }

    public unsetRequestToken = () => {
        if (this.responseInterceptorId) {
            this.ctx.$api.unmountRequestInterceptor(this.responseInterceptorId);
            this.responseInterceptorId = undefined;
        }

        if (this.authResponseInterceptorId) {
            this.ctx.$authApi.unmountRequestInterceptor(this.authResponseInterceptorId);
            this.authResponseInterceptorId = undefined;
        }

        this.ctx.$api.unsetAuthorizationHeader();
        this.ctx.$authApi.unsetAuthorizationHeader();
    };

    // --------------------------------------------------------------------

    /**
     * Get access token with given credentials.
     *
     * @param username
     * @param password
     */
    public async getTokenWithPassword(username: string, password: string) : Promise<OAuth2TokenGrantResponse> {
        const data = await this.client.token.createWithPasswordGrant({
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
    public async getTokenWithRefreshToken(token: string) : Promise<OAuth2TokenGrantResponse> {
        const data = await this.client.token.createWithRefreshToken({
            refresh_token: token,
        });

        this.setRequestToken(data.access_token);

        await this.ctx.store.dispatch('auth/triggerSetTokenExpireDate', { kind: OAuth2TokenKind.ACCESS, date: new Date(Date.now() + data.expires_in * 1000) });
        await this.ctx.store.dispatch('auth/triggerSetToken', { kind: OAuth2TokenKind.ACCESS, token: data.access_token });
        await this.ctx.store.dispatch('auth/triggerSetToken', { kind: OAuth2TokenKind.REFRESH, token: data.refresh_token });

        await this.ctx.store.dispatch('auth/triggerRefreshMe');

        return data;
    }
}
