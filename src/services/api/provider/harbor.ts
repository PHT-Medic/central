import ApiService, {ApiRequestConfig} from "../index";

class HarborApi extends ApiService {
    constructor() {
        const config : ApiRequestConfig = {
            baseURL: 'https://harbor.personalhealthtrain.de/api/v2.0/'
        }

        super(config);

        const username = 'pht';
        const password = 'PangerLenis32';

        this.api.interceptors.request.use((request: ApiRequestConfig) => {
            request.headers.common['Authorization'] = 'Basic ' + Buffer.from(username+':'+password).toString('base64');

            return request;
        });
    }
}

let instance : HarborApi | undefined;

export function useHarborApi() {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    instance = new HarborApi();
    return instance;
}
