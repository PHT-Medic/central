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

export async function getAPIServices(options?: BuildInput<Service>) : Promise<CollectionResourceResponse<Service>> {
    const {data} = await useAPI(APIType.DEFAULT).get('services' + buildQuery(options));

    return data;
}

export async function getAPIService(id: string, options?: BuildInput<Service>) : Promise<SingleResourceResponse<Service>> {
    const {data} = await useAPI(APIType.DEFAULT).get('services/' + id + buildQuery(options));

    return data;
}

export async function executeAPIServiceTask(id: string, task: string, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    const {data: resultData} = await useAPI(APIType.DEFAULT).post('services/' + id + '/task', {task, ...data});

    return resultData;
}

export async function executeAPIServiceClientTask(id: number, task: string, data: Record<string, any>) : Promise<SingleResourceResponse<Service>> {
    const {data: resultData} = await useAPI(APIType.DEFAULT).post('services/' + id + '/client/task', {task, ...data});

    return resultData;
}
