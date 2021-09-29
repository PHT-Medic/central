import {APIConfig} from "./type";

const configMap: Map<string, APIConfig<any>> = new Map<string, APIConfig<any>>();

export function setAPIConfig(
    key: string,
    value: APIConfig<any>
) {
    configMap.set(key, value);

    return value;
}

export function getAPIConfig(
    key: string
): APIConfig<any> {
    const data: APIConfig<any> | undefined = configMap.get(key);
    if (typeof data === 'undefined') {
        throw new Error(`A config must be defined for the alias: ${key}`);
    }

    return data;
}
