/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildQuery, BuildInput} from "@trapi/query";
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../modules";
import {Service} from "./entity";
import {RegistryCommand, RegistryCommandType} from "./harbor";
import {StaticService, StaticServiceType} from "./type";

export async function getAPIServices(options?: BuildInput<Service>) : Promise<CollectionResourceResponse<Service>> {
    const {data} = await useAPI(APIType.DEFAULT).get('services' + buildQuery(options));

    return data;
}

export async function getAPIService(id: string, options?: BuildInput<Service>) : Promise<SingleResourceResponse<Service>> {
    const {data} = await useAPI(APIType.DEFAULT).get('services/' + id + buildQuery(options));

    return data;
}

export async function executeAPIServiceTask(id: StaticServiceType, command: string, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    const {data: resultData} = await useAPI(APIType.DEFAULT).post('services/' + id + '/command', {command, ...data});

    return resultData;
}

export async function executeAPIRegistryServiceCommand(command: RegistryCommandType, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    return await executeAPIServiceTask(StaticService.REGISTRY, command, data);
}

export async function executeAPISecretStorageServiceCommand(command: RegistryCommandType, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    return await executeAPIServiceTask(StaticService.SECRET_STORAGE, command, data);
}

export async function executeAPIServiceClientCommand(id: StaticServiceType, command: string, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    const {data: resultData} = await useAPI(APIType.DEFAULT).post('services/' + id + '/client-command', {command, ...data});

    return resultData;
}
