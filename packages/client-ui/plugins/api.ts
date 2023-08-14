/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setAPIClient } from '@authup/client-vue';
import type {
    ClientResponseErrorTokenHookOptions,
} from '@authup/core';
import {
    APIClient as AuthAPIClient,
    ClientResponseErrorTokenHook,
} from '@authup/core';
import { APIClient, ErrorCode } from '@personalhealthtrain/core';
import { HookName, isObject } from 'hapic';
import type { Pinia } from 'pinia';
import { storeToRefs } from 'pinia';
import { LicenseAgreementEvent, useLicenseAgreementEventEmitter } from '../domains/license-agreement';
import { useAuthStore } from '../store/auth';
import { useRuntimeConfig } from '#imports';

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
export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();

    let { apiUrl } = runtimeConfig.public;

    const resourceAPI = new APIClient({ baseURL: apiUrl });
    resourceAPI.on(HookName.RESPONSE_ERROR, (error) => {
        if (
            error.response &&
            isObject(error.response.data)
        ) {
            if (error.response.data.code === ErrorCode.LICENSE_AGREEMENT) {
                const eventEmitter = useLicenseAgreementEventEmitter();
                eventEmitter.emit(LicenseAgreementEvent.ACCEPT);

                return new Promise((resolve, reject) => {
                    eventEmitter.on(LicenseAgreementEvent.ACCEPTED, () => {
                        resolve(resourceAPI.request(error.request));
                    });

                    eventEmitter.on(LicenseAgreementEvent.DECLINED, () => {
                        reject(error);
                    });
                });
            }
        }

        throw error;
    });
    ctx.provide('api', resourceAPI);

    // -----------------------------------------------------------------------------------

    apiUrl = runtimeConfig.public.authupApiUrl;

    const authupAPI = new AuthAPIClient({ baseURL: apiUrl });

    ctx.provide('authupAPI', authupAPI);

    setAPIClient(authupAPI);

    // -----------------------------------------------------------------------------------

    const store = useAuthStore(ctx.$pinia as Pinia);

    const tokenHookOptions : ClientResponseErrorTokenHookOptions = {
        baseURL: runtimeConfig.public.apiUrl,
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
