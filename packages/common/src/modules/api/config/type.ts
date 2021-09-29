/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {ApiRequestConfig} from "../type";

export type APIServiceHarborConfig = {
    host: string,
    user: string,
    password: string,
    token: string
}

export type APIServiceVaultConfig = {
    host: string,
    token: string
}

export type APIDefaultType = 'default';
export type APIVaultType = 'vault';
export type APIHarborType = 'harbor';

export type APIConnectionType<T extends APIConfigType> = T extends APIVaultType ? APIServiceVaultConfig : T extends APIHarborType ? APIServiceHarborConfig : never;

export type APIConfigType = APIDefaultType | APIVaultType | APIHarborType;
export type APIConfig<T extends APIConfigType> = {
    type?: T,
    driver?: ApiRequestConfig,
    connection?: APIConnectionType<T>,
    connectionString?: string
}
