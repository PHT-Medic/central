import {AxiosRequestConfig, AxiosResponse} from "axios";

export interface ApiRequestConfig extends AxiosRequestConfig {
    token?: string | null,
    alias?: string
}

export interface ApiResponse<T = any> extends AxiosResponse {

}
