import {
    API_CONFIG_DEFAULT_KEY,
    APIConfig, APIDefaultType,
    APIHarborType,
    APIVaultType,
    getAPIConfig
} from "./config";
import {BaseAPI} from "./module";
import {HarborAPI, VaultAPI} from "./service";

const instanceMap: Map<string, BaseAPI> = new Map<string, BaseAPI>();

export type APIReturnType<T extends APIHarborType | APIVaultType | APIDefaultType> =
    T extends APIHarborType ? HarborAPI :
        T extends APIVaultType ? VaultAPI :
            BaseAPI;

export function useAPI<T extends APIVaultType | APIHarborType | APIDefaultType>(
    key?: string,
) : APIReturnType<T> {
    key ??= API_CONFIG_DEFAULT_KEY;

    const config : APIConfig<T> = getAPIConfig(key);

    if(instanceMap.has(config.type)) {
        return instanceMap.get(config.type) as APIReturnType<T>;
    }

    let instance : BaseAPI;

    switch (config.type) {
        case 'harbor':
            instance = new HarborAPI(config as APIConfig<APIHarborType>);
            break;
        case 'vault':
            instance = new VaultAPI(config as APIConfig<APIVaultType>);
            break;
        default:
            instance = new BaseAPI(config.driver);
            break;
    }

    instanceMap.set(config.type, instance);

    return instance as APIReturnType<T>;
}
