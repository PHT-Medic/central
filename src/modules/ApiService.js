import axios from "axios";

const ApiService = {
    init(baseURL) {
        axios.defaults.baseURL = baseURL;
    },

    // Http methods
    get(resource) {
        return axios.get(resource)
    },

    post(resource, data) {
        return axios.post(resource, data)
    },

    put(resource, data) {
        return axios.put(resource, data)
    },

    delete(resource) {
        return axios.delete(resource)
    },

    customRequest(data) {
        return axios(data)
    },

    // Header methods
    setHeader(key,value) {
        axios.defaults.headers.common[key] = value;
    },
    unsetHeader(key) {
        if(key in axios.defaults.headers.common) delete axios.defaults.headers.common[key];
    },
    resetHeader() {
        axios.defaults.headers.common = {}
    },
};

export { ApiService };