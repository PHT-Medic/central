import axios from 'axios';

const apiFactory = {
    create() {
        let instance = axios.create();

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
        }
    })
}
export default apiFactory;
