/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIType, setAPIConfig, useAPI} from "@personalhealthtrain/ui-common";
import {Context} from "@nuxt/types";

export default (ctx: Context) => {
    let apiUrl : string | undefined;

    apiUrl = process.env.API_URL;

    if(typeof ctx.$config.apiUrl === 'string') {
        apiUrl = ctx.$config.apiUrl;
    }

    setAPIConfig(APIType.DEFAULT, {
        driver: {
            baseURL: apiUrl,
            withCredentials: true
        }
    })

    useAPI<APIType.DEFAULT>(APIType.DEFAULT).mountResponseInterceptor(r => r, (error => {
        if(typeof error?.response?.data?.message === 'string') {
            error.message = error.response.data.message;
            throw error;
        }

        throw new Error('A network error occurred.');
    }));
}
