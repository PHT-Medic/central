import ApiService, {ApiRequestConfig} from "../index";
import {APIServiceError} from "./error";

export type HarborConnectionConfig = {
    host: string,
    user: string,
    password: string,
    token: string
}

export function parseHarborConnectionString(connectionString: string) : HarborConnectionConfig {
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

class HarborApi extends ApiService {
    constructor(connectionString: string) {
        const harborConfig : HarborConnectionConfig = parseHarborConnectionString(connectionString);

        const config : ApiRequestConfig = {
            baseURL: harborConfig.host
        }

        super(config);

        this.api.interceptors.request.use((request: ApiRequestConfig) => {
            request.headers.common.Authorization = 'Basic ' + harborConfig.token;

            return request;
        });
    }
}

let instance : HarborApi | undefined;

export function useHarborApi(connectionString?: string) {
    if(typeof instance !== 'undefined') {
        return instance;
    }

    if(typeof connectionString === 'undefined') {
        throw APIServiceError.connectionStringMissing('harbor');
    }

    instance = new HarborApi(connectionString);
    return instance;
}
