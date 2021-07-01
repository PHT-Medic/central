import {useApi} from "~/modules/api";
import {Context} from "@nuxt/types";
import {ApiRequestConfig} from "~/modules/api/base";
import {changeRequestKeyCase, changeResponseKeyCase} from "~/modules/api/utils";
import {AxiosError} from "axios";
import {clearObjectProperties} from "~/modules/utils";

export default (ctx: Context) => {
    let apiUrl : string | undefined;

    apiUrl = process.env.API_URL;

    if(typeof ctx.$config.apiUrl === 'string') {
        apiUrl = ctx.$config.apiUrl;
    }

    const authApi = useApi('auth', {
        baseURL: apiUrl
    }, ctx);

    authApi.mountRequestInterceptor((value: ApiRequestConfig) => {
        try {
            if (value.method?.toLocaleLowerCase() === 'post') {
                const contentType: string = value.headers['Content-Type'] ?? 'application/json';
                const isJsoN: boolean = contentType.includes('application/json');
                if (isJsoN && value.data) {
                    value.data = changeRequestKeyCase(clearObjectProperties(value.data));
                }
            }
        } catch (e) {
            console.log('Request interceptor failed');
        }

        return value;
    }, (e: AxiosError) => {
        throw e;
    });

    authApi.mountResponseInterceptor((value: any) => {
        const contentType: string = value.headers['Content-Type'] ?? 'application/json';
        const isJsoN: boolean = contentType.includes('application/json');
        if (isJsoN && value.data) {
            value.data = changeResponseKeyCase(value.data);
        }

        return value;
    }, (e: AxiosError) => {
        throw e;
    });

    authApi.mountResponseInterceptor(r => r, (error => {
        if(typeof error?.response?.data?.message === 'string') {
            error.message = error.response.data.message;
            throw error;
        }

        throw new Error('A network or unknown error occurred.');
    }));
}
