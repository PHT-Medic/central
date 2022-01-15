/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrapiClientConfig, setTrapiClient,
} from '@trapi/client';
import { Context } from '@nuxt/types';
import https from 'https';
import { Inject } from '@nuxt/types/app';
import { APIClient } from '../modules/api';
import { AuthAPIClient } from '../modules/api/auth';

declare module '@nuxt/types' {
    interface Context {
        $api: APIClient,
        $authApi: AuthAPIClient
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $api: APIClient,
        $authApi: AuthAPIClient
    }
}

export default (ctx: Context, inject : Inject) => {
    let apiUrl : string | undefined;

    apiUrl = process.env.API_URL;

    if (typeof ctx.$config.apiUrl === 'string') {
        apiUrl = ctx.$config.apiUrl;
    }

    const config : TrapiClientConfig = {
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
    };

    const resourceAPI = new APIClient(config);
    const authAPI = new AuthAPIClient(config);

    const interceptor = (error) => {
        if (typeof error?.response?.data?.message === 'string') {
            error.message = error.response.data.message;
            throw error;
        }

        throw new Error('A network error occurred.');
    };

    resourceAPI.mountResponseInterceptor((r) => r, interceptor);
    authAPI.mountResponseInterceptor((r) => r, interceptor);

    setTrapiClient('default', resourceAPI);
    setTrapiClient('auth', authAPI);

    inject('api', resourceAPI);
    inject('authApi', authAPI);
};
