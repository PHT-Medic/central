/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/query";
import {
    APIType,
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../../modules";
import {Train} from "./entity";
import {TrainCommand} from "./type";

export async function getAPITrains(options?: RequestRecord<Train>) : Promise<CollectionResourceResponse<Train>> {
    const {data: response} = await useAPI(APIType.DEFAULT).get('trains' + formatRequestRecord(options));
    return response;
}

export async function getAPITrain(id: typeof Train.prototype.id) : Promise<SingleResourceResponse<Train>> {
    const {data: response} = await useAPI(APIType.DEFAULT).get('trains/' + id);

    return response;
}

export async function dropAPITrain(id: typeof Train.prototype.id) : Promise<SingleResourceResponse<Train>> {
    const {data: response} = await useAPI(APIType.DEFAULT).delete('trains/' + id);

    return response;
}

export async function editAPITrain(id: typeof Train.prototype.id, data: Partial<Train>) : Promise<SingleResourceResponse<Train>> {
    const {data: response} = await useAPI(APIType.DEFAULT).post('trains/' + id, data);

    return response;
}

export async function addAPITrain(data: Partial<Train>) : Promise<SingleResourceResponse<Train>> {
    const {data: response} = await useAPI(APIType.DEFAULT).post('trains', data);

    return response;
}

export async function runAPITrainCommand(id: typeof Train.prototype.id, command: TrainCommand, data: Record<string, any> = {}) : Promise<SingleResourceResponse<Train>> {
    const actionData = {
        command,
        ...data
    };

    const {data: response} = await useAPI(APIType.DEFAULT).post('trains/' + id + '/command', actionData);

    return response;
}
