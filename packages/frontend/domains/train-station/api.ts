/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getTrainStations(options?: RequestRecord) {
    const {data: response} = await useApi('auth').get('train-stations'+formatRequestRecord(options));
    return response;
}

export async function getTrainStation(id: string) {
    const {data: response} = await useApi('auth').get('train-stations/'+id);

    return response;
}

export async function dropTrainStation(id: string) {
    const {data: response} = await useApi('auth').delete('train-stations/'+id);

    return response;
}

export async function editTrainStation(id: number, data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('train-stations/'+id , data);

    return response;
}

export async function addTrainStation(data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('train-stations', data);

    return response;
}
