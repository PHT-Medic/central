/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Context } from '@nuxt/types';
import https from 'https';
import type { Inject } from '@nuxt/types/app';
import { HTTPClient as AuthHTTPClient } from '@authup/common';
import { setHTTPClient } from '@authup/vue2';
import { ErrorCode, HTTPClient } from '@personalhealthtrain/central-common';
import { LicenseAgreementCommand, useLicenseAgreementEventEmitter } from '../domains/license-agreement';

const interceptor = (error) => {
    if (typeof error?.response?.data?.code === 'string') {
        if (error.response.data.code === ErrorCode.LICENSE_AGREEMENT) {
            const eventEmitter = useLicenseAgreementEventEmitter();
            eventEmitter.emit(LicenseAgreementCommand.ACCEPT);
        }
    }

    if (typeof error?.response?.data?.message === 'string') {
        error.message = error.response.data.message;
        throw error;
    }

    throw new Error('A network error occurred.');
};

export default (ctx: Context, inject : Inject) => {
    let apiUrl = ctx.$config.apiUrl || process.env.API_URL;

    const resourceAPI = new HTTPClient({
        driver: {
            baseURL: apiUrl,
            withCredentials: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                ...(process.server ? {
                    proxy: false,
                } : {}),
            }),
        },
    });
    resourceAPI.mountResponseInterceptor((r) => r, interceptor);
    inject('api', resourceAPI);

    // -----------------------------------------------------------------------------------

    apiUrl = ctx.$config.authApiUrl || process.env.AUTH_API_URL;

    const authAPI = new AuthHTTPClient({
        driver: {
            baseURL: apiUrl,
            withCredentials: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                ...(process.server ? {
                    proxy: false,
                } : {}),
            }),
        },
    });

    authAPI.mountResponseInterceptor((r) => r, interceptor);
    inject('authApi', authAPI);

    setHTTPClient(authAPI);
};
