/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import https from 'https';
import {
    AbilityManager,
    AbilityMeta,
    HTTPOAuth2Client,
    OAuth2TokenKind,
    OAuth2TokenResponse,
    OAuth2TokenSubKind,
    PermissionMeta, Robot, TokenVerificationPayload, User, buildAbilityMetaFromName,
} from '@authelion/common';
import { Config, createClient } from '@trapi/client';
import { AuthBrowserStorageKey } from './constants';

export type AuthModuleOptions = {
    tokenHost: string,
    tokenPath: string,
    userInfoPath: string
};

class AuthModule {
    protected ctx: Context;

    protected client: HTTPOAuth2Client;

    protected refreshTokenJob: undefined | ReturnType<typeof setTimeout>;

    protected responseInterceptorId : number | undefined;

    protected authResponseInterceptorId : number | undefined;

    protected abilityManager!: AbilityManager;

    protected identifyPromise : Promise<User | Robot | undefined>;

    // --------------------------------------------------------------------

    constructor(ctx: Context, options: AuthModuleOptions) {
        this.ctx = ctx;

        const httpClient : Config = {
            driver: {
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            },
        };

        if (
            process.server
        ) {
            httpClient.driver.proxy = false;
        }

        this.client = new HTTPOAuth2Client({
            token_host: options.tokenHost,
            token_path: options.tokenPath,
            user_info_path: options.userInfoPath,
            client_id: 'user-interface',
        }, httpClient);

        this.client.httpClient.mountResponseInterceptor((r) => r, ((error) => {
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
        this.setPermissions(permissions);
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
                    this.setPermissions(mutation.payload);
                    break;
                case 'auth/unsetPermissions':
                    this.setPermissions([]);
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

                        Promise.resolve()
                            .then(() => this.ctx.store.dispatch('auth/triggerRefreshToken'))
                            .catch(() => this.ctx.redirect({
                                path: '/logout',
                                query: { redirect: this.ctx.route.fullPath },
                            }));
                    };

                    callback.bind(this);

                    if (date instanceof Date) {
                        const timeoutMilliSeconds = date.getTime() - Date.now();

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

    public async resolveMe() : Promise<User | Robot | undefined> {
        if (typeof this.identifyPromise !== 'undefined') {
            return this.identifyPromise;
        }

        const token : string | undefined = this.ctx.store.getters['auth/accessToken'];
        if (!token) return Promise.resolve(undefined);

        const permissionsResolved = this.ctx.store.getters['auth/resolved'];
        if (permissionsResolved) {
            return Promise.resolve(this.ctx.store.getters['auth/user']);
        }

        this.identifyPromise = this.verifyToken(token)
            .then(async (token) => {
                await this.ctx.store.commit('auth/setResolved', true);
                await this.ctx.store.dispatch('auth/triggerSetPermissions', token.target.permissions);
                await this.ctx.store.dispatch('auth/triggerSetUser', token.target.entity);

                switch (token.target.kind) {
                    case OAuth2TokenSubKind.USER:
                        await this.ctx.store.dispatch('auth/triggerSetUser', token.target.entity);
                        break;
                    case OAuth2TokenSubKind.ROBOT:
                        await this.ctx.store.dispatch('auth/triggerSetRobot', token.target.entity);
                        break;
                }

                return token.target.entity;
            });

        return this.identifyPromise;
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

    public setPermissions(permissions: PermissionMeta[]) {
        if (!Array.isArray(permissions)) return;

        this.abilityManager.setPermissions(permissions);
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
                    return this.ctx.store.dispatch('auth/triggerRefreshToken')
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
    public async getTokenWithPassword(username: string, password: string) : Promise<OAuth2TokenResponse> {
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
    public async getTokenWithRefreshToken(token: string) : Promise<OAuth2TokenResponse> {
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
    public async verifyToken(token: string) : Promise<TokenVerificationPayload> {
        return this.client.getUserInfo(token);
    }
}

export default AuthModule;
