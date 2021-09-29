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
