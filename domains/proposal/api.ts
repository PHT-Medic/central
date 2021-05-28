import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function addProposal(data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('proposals', data);

        return response.data;
    } catch (e) {
        throw new Error(e.response.data.error.message);
    }
}

export async function getProposal(id: number, requestRecord?: RequestRecord) {
    const response = await useApi('auth').get('proposals/' + id + formatRequestRecord(requestRecord));

    return response.data;
}

export async function dropProposal(id: number) {
    try {
        const response = await useApi('auth').delete('proposals/' + id);
        return response.data;
    } catch (e) {
        throw new Error('Der Antrag konnte nicht gelöscht werden.');
    }
}

export async function editProposal(id: number, data: Record<string, any>) {
    const response = await useApi('auth').post('proposals/' + id, data);
    return response.data;
}

export async function getApiProposals(record?: RequestRecord) {
    const response = await useApi('auth').get('proposals' + formatRequestRecord(record));
    return response.data;
}
