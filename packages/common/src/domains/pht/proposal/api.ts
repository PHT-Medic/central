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
import {Proposal} from "./entity";
import {nullifyEmptyObjectProperties} from "../../../utils";

export async function addProposal(data: Record<string, any>) : Promise<SingleResourceResponse<Proposal>> {
    const response = await useAPI(APIType.DEFAULT).post('proposals', nullifyEmptyObjectProperties(data));

    return response.data;
}

export async function getProposal(id: number, requestRecord?: BuildInput<Proposal>) : Promise<SingleResourceResponse<Proposal>> {
    const response = await useAPI(APIType.DEFAULT).get('proposals/' + id + buildQuery(requestRecord));

    return response.data;
}

export async function dropProposal(id: number): Promise<SingleResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).delete('proposals/' + id);
    return response.data;
}

export async function editProposal(id: number, data: Record<string, any>): Promise<SingleResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).post('proposals/' + id, nullifyEmptyObjectProperties(data));
    return response.data;
}

export async function getProposals(record?: BuildInput<Proposal>): Promise<CollectionResourceResponse<Proposal>>  {
    const response = await useAPI(APIType.DEFAULT).get('proposals' + buildQuery(record));
    return response.data;
}
