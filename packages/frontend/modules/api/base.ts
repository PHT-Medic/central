import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {Context} from "@nuxt/types";
import {AuthStoreToken} from "~/store/auth";

class BaseApi {
    private ctx: Context | undefined;

    private api: AxiosInstance;

    private authResponseInterceptor : number | undefined;

    //---------------------------------------------------------------------------------

    /**
     * API Service
     *
     * @param config
     * @param ctx
     */
    constructor(config?: ApiRequestConfig, ctx?: Context) {
        this.api = axios.create(config);
        if(typeof ctx !== 'undefined') {
            this.setContext(ctx);
        }
    }

    get config() : ApiRequestConfig {
        return this.api.defaults;
    }

    //---------------------------------------------------------------------------------

    public setContext(ctx: Context) {
        this.ctx = ctx;
        this.subscribeStore();
    }

    //---------------------------------------------------------------------------------

    private subscribeStore() {
        if (typeof this.ctx === 'undefined') return;

        this.ctx.store.subscribe((mutation: any, state: any) => {
            switch (mutation.type) {
                case 'auth/setToken':
                    let token = <AuthStoreToken> mutation.payload;
                    this.setAuthorizationBearerHeader(token.accessToken);
                    break;
                case 'auth/unsetToken':
                    this.unsetAuthorizationBearerHeader();
                    break;
            }
        });
    }

    //---------------------------------------------------------------------------------

    public mountResponseInterceptor(onFulfilled: (value: ApiResponse<any>) => any | Promise<AxiosResponse<any>>, onRejected: (error: any) => any) : number {
        return this.api.interceptors.response.use(onFulfilled, onRejected);
    }

    public unmountResponseInterceptor(id: number) {
        this.api.interceptors.response.eject(id);
    }

    //---------------------------------------------------------------------------------

    public mountRequestInterceptor(onFulfilled: (value: ApiRequestConfig) => any | Promise<ApiRequestConfig>, onRejected: (error: any) => any) : number {
        return this.api.interceptors.request.use(onFulfilled, onRejected);
    }

    public unmountRequestInterceptor(id: number) {
        this.api.interceptors.request.eject(id);
    }

    //---------------------------------------------------------------------------------

    public mountAuthResponseInterceptor() {
        if(typeof this.ctx === 'undefined') return;

        this.authResponseInterceptor = this.mountResponseInterceptor((data) => data, (error: any) => {
            if(typeof this.ctx === 'undefined') return;

            if(typeof error !== 'undefined' && error && typeof error.response !== 'undefined') {
                if (error.response.status === 401) {
                    // Refresh the access accessToken
                    try {
                        this.ctx.store.dispatch('auth/triggerRefreshToken').then(() => {
                            return axios({
                                method: error.config.method,
                                url: error.config.url,
                                data: error.config.data
                            });
                        });
                    } catch (e) {
                        //this.ctx.store.dispatch('triggerSetLoginRequired', true).then(r => r);
                        this.ctx.redirect('/logout');

                        throw error;
                    }
                }

                throw error;
            }
        });
    }

    public unMountAuthResponseInterceptor() {
        if(typeof this.authResponseInterceptor === 'number') {
            this.unmountResponseInterceptor(this.authResponseInterceptor);
        }
    }

    public isAuthResponseInterceptorMounted() : boolean {
        return typeof this.authResponseInterceptor !== 'undefined';
    }

    //---------------------------------------------------------------------------------
    /**
     * Extend Api Request Config.
     *
     * @param config
     */
    public extendConfig(config?: ApiRequestConfig) {
        Object.assign(this.api.defaults, this.api.defaults, config);
    }

    //---------------------------------------------------------------------------------

    public setHeader(key: string, value: string) {
        this.api.defaults.headers.common[key] = value;
    }

    public setAuthorizationBearerHeader(token: string) {
        this.setHeader('Authorization','Bearer ' + token);
    }

    //---------------------------------------------------------------------------------

    public unsetHeader(key: string) {
        if (key in this.api.defaults.headers.common) { delete this.api.defaults.headers.common[key] }
    }

    public unsetAuthorizationBearerHeader() {
        this.unsetHeader('Authorization');
    }

    //---------------------------------------------------------------------------------

    public resetHeader() {
        this.api.defaults.headers.common = {};
    }

    //---------------------------------------------------------------------------------

    public request<T, R = ApiResponse<T>> (config: ApiRequestConfig): Promise<R> {
        return this.api.request(config);
    }

    //---------------------------------------------------------------------------------

    public get<T, R = ApiResponse<T>> (url: string, config?: ApiRequestConfig): Promise<R> {
        return this.api.get(url, config);
    }

    //---------------------------------------------------------------------------------

    public delete<T, R = ApiResponse<T>> (url: string, config?: ApiRequestConfig): Promise<R> {
        return this.api.delete(url, config);
    }

    //---------------------------------------------------------------------------------

    public head<T, R = ApiResponse<T>> (url: string, config?: ApiRequestConfig): Promise<R> {
        return this.api.head(url, config);
    }

    //---------------------------------------------------------------------------------

    public post<T, R = ApiResponse<T>> (url: string, data?: any, config?: ApiRequestConfig): Promise<R> {
        return this.api.post(url, data, config);
    }

    //---------------------------------------------------------------------------------

    public put<T, R = ApiResponse<T>> (url: string, data?: any, config?: ApiRequestConfig): Promise<R> {
        return this.api.put(url, data, config);
    }

    //---------------------------------------------------------------------------------

    public patch<T, R = ApiResponse<T>> (url: string, data?: any, config?: ApiRequestConfig): Promise<R> {
        return this.api.patch(url, data, config);
    }
}

//---------------------------------------------------------------------------------

interface ApiRequestConfig extends AxiosRequestConfig {
    token?: string | null
}

interface ApiResponse<T = any> extends AxiosResponse {

}

//---------------------------------------------------------------------------------

/**
 * Create new Base Api instance.
 *
 * @param config
 * @param ctx
 */
export function createBaseApi(config?: ApiRequestConfig, ctx?: Context) {
    return new BaseApi(config, ctx);
}

export {
    ApiResponse,
    ApiRequestConfig
}

export default BaseApi;
