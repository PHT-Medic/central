import {AxiosRequestConfig, AxiosResponse} from "axios";

export interface ApiRequestConfig extends AxiosRequestConfig {
    token?: string | null,
    alias?: string
}

export interface ApiResponse<T = any> extends AxiosResponse {

}

export type ResourceSimpleResponse<R> = R;
export type ResourceCollectionResponse<R> = {
    data: R[],
    meta: {
        limit: number,
        offset: number,
        total: number
    }
}
