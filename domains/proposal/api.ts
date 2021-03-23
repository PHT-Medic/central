import {changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function addProposal(data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('pht/proposals', data);

        return response.data;
    } catch (e) {
        throw new Error(e.response.data.error.message);
    }
}

export async function getProposal(id: number) {
    try {
        const response = await useApi('auth').get('pht/proposals/' + id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Antrag konnte nicht gefunden werden.');
    }
}

export async function dropProposal(id: number) {
    try {
        const response = await useApi('auth').delete('pht/proposals/' + id);
        return response.data;
    } catch (e) {
        throw new Error('Der Antrag konnte nicht gelöscht werden.');
    }
}

export async function editProposal(id: number, data: Record<string, any>) {
    const response = await useApi('auth').post('pht/proposals/' + id, data);
    return changeResponseKeyCase(response.data);
}

export async function getApiProposals(record?: RequestRecord) {
    const response = await useApi('auth').get('pht/proposals' + formatRequestRecord(record));
    return changeResponseKeyCase(response.data);
}
