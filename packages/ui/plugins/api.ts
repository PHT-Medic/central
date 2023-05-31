/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setAPIClient } from '@authup/client-vue';
import type {
    TokenCreator,
    TokenCreatorCreatedHook,
    TokenCreatorFailedHook,
    TokenCreatorOptions,
} from '@authup/core';
import {
    APIClient as AuthAPIClient,
    ClientResponseErrorTokenHook,
} from '@authup/core';
import { APIClient, ErrorCode } from '@personalhealthtrain/central-common';
import { HookName, isObject } from 'hapic';
import type { Pinia } from 'pinia';
import { storeToRefs } from 'pinia';
import { LicenseAgreementCommand, useLicenseAgreementEventEmitter } from '../domains/license-agreement';
import { useAuthStore } from '../store/auth';

declare module '#app' {
    interface NuxtApp {
        $api: APIClient;
        $authupAPI: AuthAPIClient;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: APIClient;
        $authupAPI: AuthAPIClient;
    }
}

// todo: import this in v0.37.0
type TokenHookOptions = {
    /**
     * The URL of the api service.
     *
     * default: client.baseURL
     */
    baseURL?: string,
    /**
     * Whether to set a timer to refresh the access token?
     *
     * default: true
     */
    timer?: boolean,
    /**
     * Fn to create a new token, if the previous token expired.
     */
    tokenCreator: TokenCreatorOptions | TokenCreator,
    /**
     * Called when the token creator created a new token.
     */
    tokenCreated?: TokenCreatorCreatedHook,
    /**
     * Called when the token creator could not create a new token.
     */
    tokenFailed?: TokenCreatorFailedHook,
};

export default defineNuxtPlugin((ctx) => {
    let { apiUrl } = ctx.$config.public;

    const resourceAPI = new APIClient({ baseURL: apiUrl });
    resourceAPI.on(HookName.RESPONSE_ERROR, (error) => {
        if (
            error.response &&
            isObject(error.response.data)
        ) {
            if (error.response.data.code === ErrorCode.LICENSE_AGREEMENT) {
                const eventEmitter = useLicenseAgreementEventEmitter();
                eventEmitter.emit(LicenseAgreementCommand.ACCEPT);
            }
        }

        throw error;
    });
    ctx.provide('api', resourceAPI);

    // -----------------------------------------------------------------------------------

    apiUrl = ctx.$config.public.authupApiUrl;

    const authupAPI = new AuthAPIClient({ baseURL: apiUrl });

    ctx.provide('authupAPI', authupAPI);

    setAPIClient(authupAPI);

    // -----------------------------------------------------------------------------------

    const store = useAuthStore(ctx.$pinia as Pinia);

    const tokenHookOptions : TokenHookOptions = {
        baseURL: ctx.$config.public.apiUrl,
        tokenCreator: () => {
            const { refreshToken } = storeToRefs(store);

            if (!refreshToken.value) {
                throw new Error('No refresh token available.');
            }

            return authupAPI.token.createWithRefreshToken({
                refresh_token: refreshToken.value,
            });
        },
        tokenCreated: (response) => {
            store.setAccessTokenExpireDate(undefined);

            setTimeout(() => {
                store.handleTokenGrantResponse(response);
            }, 0);
        },
        tokenFailed: () => {
            store.logout();
        },
    };

    const authupTokenHook = new ClientResponseErrorTokenHook(
        authupAPI,
        tokenHookOptions,
    );

    const resourceTokenHook = new ClientResponseErrorTokenHook(
        resourceAPI,
        {
            ...tokenHookOptions,
            timer: false,
            tokenCreated(response) {
                authupTokenHook.setTimer(response);

                if (tokenHookOptions.tokenCreated) {
                    tokenHookOptions.tokenCreated(response);
                }
            },
        },
    );

    store.$subscribe((mutation, state) => {
        if (mutation.storeId !== 'auth') return;

        if (state.accessToken) {
            resourceAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            authupAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            resourceTokenHook.mount();
            authupTokenHook.mount();
        } else {
            resourceAPI.unsetAuthorizationHeader();
            authupAPI.unsetAuthorizationHeader();

            resourceTokenHook.unmount();
            authupTokenHook.unmount();
        }
    });
});
