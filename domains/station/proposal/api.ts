import {buildUrlRelationsSuffix, formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getApiStationProposals(stationId: number, type: 'self' | 'related', record?: RequestRecord) {
    let url = buildUrlRelationsSuffix('stations', stationId, 'proposals', type);

    try {
        const response = await useApi('auth').get('pht/'+url+formatRequestRecord(record));

        return response.data;
    } catch (e) {
        throw new Error('Die Anträge konnten nicht geladen werden.');
    }
}

export async function getApiStationProposal(userId: number, roleId: number, type: 'self' | 'related') {
    let url = buildUrlRelationsSuffix('stations', userId, 'proposals', type);

    url += '/'+roleId;

    try {
        const response = await useApi('auth').get('pht/'+url);

        return response.data;
    } catch (e) {
        throw new Error('Die Rollen für den Benutzer existiert nicht.');
    }
}

//----------------------------------------------------

export async function editApiStationProposal(stationId: number, relationId: number, data: Record<string, any>) {
    let url = buildUrlRelationsSuffix('stations', stationId, 'proposals', 'self');

    url += '/'+relationId;

    try {
        const response = await useApi('auth').post('pht/'+url,data);

        return response.data;
    } catch (e) {
        throw new Error(e.response.data.error.message);
    }
}
