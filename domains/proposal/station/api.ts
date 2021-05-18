import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getApiProposalStations(data?: RequestRecord) {
    const response = await useApi('auth').get('pht/proposal-stations'+formatRequestRecord(data));

    return response.data;
}

export async function getApiProposalStation(id: number | string) {
    const response = await useApi('auth').get('pht/proposal-stations/'+id);

    return response.data;
}

//----------------------------------------------------

export async function addApiProposalStation(data: Record<string, any>) {
    const response = await useApi('auth').post('pht/proposal-stations', data);

    return response.data;
}

export async function editApiProposalStation(id: number | string, data: Record<string, any>) {
    const response = await useApi('auth').post('pht/proposal-stations/'+id, data);

    return response.data;
}

export async function dropApiProposalStation(id: number | string) {
    const response = await useApi('auth').delete('pht/proposal-stations/'+id);

    return response.data;
}
