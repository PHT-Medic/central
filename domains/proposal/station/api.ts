import {useApi} from "~/modules/api";
import {buildUrlRelationsSuffix} from "~/modules/api/utils";

export async function getApiProposalStations(proposalId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('proposals', proposalId, 'stations', type);

    try {
        const response = await useApi('auth').get('pht/'+url);

        return response.data;
    } catch (e) {
        throw new Error('Die Stationen konnten nicht geladen werden.');
    }
}

export async function getApiProposalStation(proposalId: number, stationId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('proposals', proposalId, 'stations', type);

    url += '/'+stationId;

    try {
        const response = await useApi('auth').get('pht/'+url);

        return response.data;
    } catch (e) {
        throw new Error('Die Station für den Antrag existiert nicht.');
    }
}

//----------------------------------------------------

export async function addApiProposalStation(proposalId: number, data: Record<string, any>, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('proposals', proposalId, 'stations', type);

    try {
        const response = await useApi('auth').post('pht/'+url, data);

        return response.data;
    } catch (e) {
        throw new Error(e.response.data.error.message);
    }
}

export async function dropApiProposalStation(proposalId: number, relationId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('proposals', proposalId, 'stations', type);

    url += '/'+relationId;

    try {
        const response = await useApi('auth').delete('pht/'+url);

        return response.data;
    } catch (e) {
        throw new Error(e.response.data.error.message);
    }
}
