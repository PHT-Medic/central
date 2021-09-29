/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getApiProposalStations(data?: RequestRecord) {
    const response = await useApi('auth').get('proposal-stations'+formatRequestRecord(data));

    return response.data;
}

export async function getApiProposalStation(id: number | string) {
    const response = await useApi('auth').get('proposal-stations/'+id);

    return response.data;
}

//----------------------------------------------------

export async function addApiProposalStation(data: Record<string, any>) {
    const response = await useApi('auth').post('proposal-stations', data);

    return response.data;
}

export async function editApiProposalStation(id: number | string, data: Record<string, any>) {
    const response = await useApi('auth').post('proposal-stations/'+id, data);

    return response.data;
}

export async function dropApiProposalStation(id: number | string) {
    const response = await useApi('auth').delete('proposal-stations/'+id);

    return response.data;
}
