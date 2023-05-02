/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HookName, isObject } from 'hapic';
import { APIClient as AuthAPIClient } from '@authup/core';
import { setAPIClient } from '@authup/client-vue';
import { APIClient, ErrorCode } from '@personalhealthtrain/central-common';
import { LicenseAgreementCommand, useLicenseAgreementEventEmitter } from '../domains/license-agreement';

declare module '#app' {
    interface NuxtApp {
        $api: APIClient;
        $authupApi: AuthAPIClient;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: APIClient;
        $authupApi: AuthAPIClient;
    }
}

export default defineNuxtPlugin((ctx) => {
    let apiUrl = ctx.$config.public.apiUrl || process.env.API_URL;

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

    apiUrl = ctx.$config.public.authupApiUrl || process.env.AUTHUP_API_URL;

    const authupAPI = new AuthAPIClient({ baseURL: apiUrl });

    ctx.provide('authupApi', authupAPI);

    setAPIClient(authupAPI);
});
