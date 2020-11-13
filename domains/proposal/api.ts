import {changeRequestKeyCase, changeResponseKeyCase} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function addProposal(data: Record<string, any>) {
    try {
        const response = await useApi('resource').post('proposals', changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Antrag konnte nicht erstellt werden.');
    }
}

export async function getProposal(id: number) {
    try {
        const response = await useApi('resource').get('proposals/' + id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Antrag konnte nicht gefunden werden.');
    }
}

export async function dropProposal(id: number) {
    try {
        const response = await useApi('resource').delete('proposals/' + id);
        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Antrag konnte nicht gelöscht werden.');
    }
}

export async function editProposal(id: number, data: Record<string, any>) {
    const response = await useApi('resource').post('proposals/' + id, data);
    return changeResponseKeyCase(response.data);
}

export async function getOutProposals() {
    const response = await useApi('resource').get('proposals/out');
    return changeResponseKeyCase(response.data);
}

export async function getInProposals() {
    const response = await useApi('resource').get('proposals/in');
    return changeResponseKeyCase(response.data);
}
