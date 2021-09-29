import {APIConfig, APIHarborType, APIServiceHarborConfig} from "../config";
import {BaseAPI} from "../module";
import {ApiRequestConfig} from "../type";
import {APIServiceError} from "./error";

export function parseHarborConnectionString(connectionString: string) : APIServiceHarborConfig {
    const parts : string[] = connectionString.split('@');
    if(parts.length !== 2) {
        throw new APIServiceError('Harbor connection string must be in the following format: user:password@host');
    }

    const host : string = parts[1];

    const authParts : string[] = parts[0].split(':');
    if(authParts.length !== 2) {
        throw new APIServiceError('Harbor connection string must be in the following format: user:password@host');
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
        token: Buffer.from(authParts[0]+':'+authParts[1]).toString('base64')
    }
}

export class HarborAPI extends BaseAPI {
    constructor(config: APIConfig<APIHarborType>) {
        const harborConfig : APIServiceHarborConfig = config.connection ?? parseHarborConnectionString(config.connectionString);

        const driverConfig : ApiRequestConfig = {
            ...(config.driver ?? {}),
            baseURL: harborConfig.host
        }

        super(driverConfig);

        this.api.interceptors.request.use((request: ApiRequestConfig) => {
            request.headers.common.Authorization = 'Basic ' + harborConfig.token;

            return request;
        });
    }
}

let instance : HarborAPI | undefined;

export function useHarborApi(connectionString?: string) {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    if(typeof connectionString === 'undefined') {
        throw APIServiceError.connectionStringMissing('harbor');
    }

    instance = new HarborAPI({connectionString});
    return instance;
}
