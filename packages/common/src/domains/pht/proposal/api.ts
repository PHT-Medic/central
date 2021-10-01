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
import {Proposal} from "./entity";

export async function addProposal(data: Record<string, any>) : Promise<SingleResourceResponse<Proposal>> {
    const response = await useAPI(APIType.DEFAULT).post('proposals', data);

    return response.data;
}

export async function getProposal(id: number, requestRecord?: RequestRecord<Proposal>) : Promise<SingleResourceResponse<Proposal>> {
    const response = await useAPI(APIType.DEFAULT).get('proposals/' + id + formatRequestRecord(requestRecord));

    return response.data;
}

export async function dropProposal(id: number): Promise<SingleResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).delete('proposals/' + id);
    return response.data;
}

export async function editProposal(id: number, data: Record<string, any>): Promise<SingleResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).post('proposals/' + id, data);
    return response.data;
}

export async function getProposals(record?: RequestRecord<Proposal>): Promise<CollectionResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).get('proposals' + formatRequestRecord(record));
    return response.data;
}
