/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import BaseApi, {ApiRequestConfig, createBaseApi} from "~/modules/api/base";
import {Context} from "@nuxt/types";

export type ApiType = 'base' | 'auth' | 'resource' | string;

let instances: { [key: string] : BaseApi } = {};

export function useApi(type: ApiType, config?: ApiRequestConfig, ctx?: Context) {
    if(!instances.hasOwnProperty(type)) {
        registerApi(type, config, ctx);
    }

    const instance = instances[type];
    if(ctx) {
        instance.setContext(ctx);
    }
    if(config) {
        instance.extendConfig(config);
    }

    return instance;
}

export function registerApi(type: ApiType, config?: ApiRequestConfig, ctx?: Context) {
    if(instances.hasOwnProperty(type)) return;

    instances[type] = createBaseApi(config, ctx);
}

export function mapOnAllApis(callback: CallableFunction) {
    let arr : ApiType[] = <ApiType[]> Object.keys(instances);

    arr.map((key) => {
        const api = useApi(key);
        callback(api);
    });
}

export default {
    useApi,
    registerApi
}
