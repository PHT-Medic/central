/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {TrainCommand} from "~/domains/train/type";

export async function getTrains(options?: RequestRecord) {
    const {data: response} = await useApi('auth').get('trains'+formatRequestRecord(options));
    return response;
}

export async function getTrain(id: string) {
    const {data: response} = await useApi('auth').get('trains/'+id);

    return response;
}

export async function dropTrain(id: string) {
    const {data: response} = await useApi('auth').delete('trains/'+id);

    return response;
}

export async function editTrain(id: number, data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('trains/'+id , data);

    return response;
}

export async function addTrain(data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('trains', data);

    return response;
}

export async function runTrainCommand(id: string, command: TrainCommand, data: Record<string,any> = {}) {
    const actionData = {
        command,
        ...data
    };

    const {data: response} = await useApi('auth').post('trains/' + id + '/command', actionData);

    return response;
}
