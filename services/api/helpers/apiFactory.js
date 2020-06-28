import axios from 'axios';
import AuthConfig from "../../../config/auth";

const apiFactory = {
    create() {
        let instance = axios.create();

        instance.defaults.headers.common['Accept-Language'] = 'de';

        return this.init(instance);
    },
    init: (instance) => ({
        init(baseURL) {
            instance.defaults.baseURL = baseURL
        },

        // Http methods
        get(resource) {
            return instance.get(resource)
        },

        post(resource, data) {
            return instance.post(resource, data)
        },

        put(resource, data) {
            return instance.put(resource, data)
        },

        delete(resource) {
            return instance.delete(resource)
        },

        customRequest(data) {
            return instance(data)
        },

        // Header methods
        setHeader(key, value) {
            instance.defaults.headers.common[key] = value
        },
        unsetHeader(key) {
            if (key in instance.defaults.headers.common) {
                delete instance.defaults.headers.common[key]
            }
        },
        resetHeader() {
            instance.defaults.headers.common = {}
        },

        // --------------------------------------------------------------------
        _interceptors: [],
        mountInterceptor (type) {
            if (type in ApiInterceptors) {
                const interceptor = ApiInterceptors[type]
                this._interceptors[type] = axios.interceptors.response.use(interceptor.response, interceptor.error)
            }
        },
        unmountInterceptor (type) {
            if (type in this._interceptors) {
                axios.interceptors.response.eject(this._interceptors[type]);
                delete this._interceptors[type]
            }
        }
    })
}

const ApiInterceptors = {
    auth: {
        response: (data) => {
            return data;
        },
        error: (error) => {
            if (error.request.status === 401) {
                let url = process.env.authApiUrl ?? AuthConfig.selfUrl;
                console.log(url);
                if (error.config.url.includes(url)) {
                    store.dispatch('auth/triggerLogout');

                    throw error;
                } else {
                    // Refresh the access accessToken
                    try {
                        store.dispatch('auth/triggerRefreshToken')
                        // Retry the original request
                        return axios({
                            method: error.config.method,
                            url: error.config.url,
                            data: error.config.data
                        });
                    } catch (e) {
                        // Refresh has failed - reject the original request
                        throw error;
                    }
                }
            }

            // If error was not 401 just reject as is
            throw error;
        }
    }
};

export default apiFactory;
export {
    ApiInterceptors
}
