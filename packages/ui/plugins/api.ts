/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setAPIClient } from '@authup/client-vue';
import type { TokenCreator } from '@authup/core';
import {
    APIClient as AuthAPIClient,
    OAuth2TokenKind,
    mountClientResponseErrorTokenHook,
    unmountClientResponseErrorTokenHook,
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

            // todo: hook required to update store !!!
            const tokenCreator : TokenCreator = () => {
                let refreshToken : string | undefined;
                if (state.refreshToken) {
                    refreshToken = state.refreshToken;
                }
                if (refreshToken) {
                    const refs = storeToRefs(store);
                    refreshToken = refs.refreshToken.value;
                }

                if (!refreshToken) {
                    throw new Error('No refresh token available.');
                }

                return authupAPI.token.createWithRefreshToken({
                    refresh_token: refreshToken as string,
                }).catch((e) => {
                    store.unsetToken(OAuth2TokenKind.REFRESH);

                    return Promise.reject(e);
                });
            };

            mountClientResponseErrorTokenHook(resourceAPI, {
                baseURL: ctx.$config.public.authupApiUrl,
                tokenCreator,
            });

            mountClientResponseErrorTokenHook(authupAPI, {
                baseURL: ctx.$config.public.authupApiUrl,
                tokenCreator,
            });
        } else {
            resourceAPI.unsetAuthorizationHeader();
            authupAPI.unsetAuthorizationHeader();

            unmountClientResponseErrorTokenHook(resourceAPI);
            unmountClientResponseErrorTokenHook(authupAPI);
        }
    });
});
