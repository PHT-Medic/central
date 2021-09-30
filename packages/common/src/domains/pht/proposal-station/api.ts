/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/data-fetching";
import {
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI
} from "../../../modules";
import {ProposalStation} from "./entity";

export async function getApiProposalStations(data?: RequestRecord<ProposalStation>) : Promise<CollectionResourceResponse<ProposalStation>> {
    const response = await useAPI('auth').get('proposal-stations' + formatRequestRecord(data));

    return response.data;
}

export async function getApiProposalStation(id: number | string) : Promise<SingleResourceResponse<ProposalStation>> {
    const response = await useAPI('auth').get('proposal-stations/' + id);

    return response.data;
}

export async function addApiProposalStation(data: Record<string, any>) : Promise<SingleResourceResponse<ProposalStation>>{
    const response = await useAPI('auth').post('proposal-stations', data);

    return response.data;
}

export async function editApiProposalStation(id: number | string, data: Record<string, any>) : Promise<SingleResourceResponse<ProposalStation>>{
    const response = await useAPI('auth').post('proposal-stations/' + id, data);

    return response.data;
}

export async function dropApiProposalStation(id: number | string): Promise<SingleResourceResponse<ProposalStation>> {
    const response = await useAPI('auth').delete('proposal-stations/' + id);

    return response.data;
}
