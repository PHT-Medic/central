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
} from "../../../modules";
import {Station} from "./entity";

export async function getAPIStations(options?: BuildInput<Station>) : Promise<CollectionResourceResponse<Station>> {
    const response = await useAPI(APIType.DEFAULT).get('stations' + buildQuery(options));

    return response.data;
}

export async function getAPIStation(id: number) : Promise<SingleResourceResponse<Station>> {
    const response = await useAPI(APIType.DEFAULT).get('stations/' + id);

    return response.data;
}

export async function addAPIStation(data: Record<string, any>) : Promise<SingleResourceResponse<Station>>  {
    const response = await useAPI(APIType.DEFAULT).post('stations', data);

    return response.data;
}

export async function editAPIStation(id: number, data: Record<string, any>) : Promise<SingleResourceResponse<Station>>  {
    const response = await useAPI(APIType.DEFAULT).post('stations/' + id, data);

    return response.data;
}

export async function dropAPIStation(id: number) : Promise<SingleResourceResponse<Station>>  {
    const response = await useAPI(APIType.DEFAULT).delete('stations/' + id);

    return response.data;
}

export async function doAPIStationTask(id: number, task: string, data: Record<string, any>) : Promise<SingleResourceResponse<Station>>  {
    const response = await useAPI(APIType.DEFAULT).post('stations/' + id + '/task', {task, ...data});

    return response.data;
}
