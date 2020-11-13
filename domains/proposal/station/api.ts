import {useApi} from "~/modules/api";

export async function addProposalStation(data: Record<string, any>) {
    const response = await useApi('resource').post('stations', data);
    return response.data;
}

export async function dropProposalStation(id: number) {
    const response = await useApi('resource').delete('stations/' + id);
    return response.data;
}

export async function getProposalStations(proposalId: number) {
    const response = await useApi('resource').get('proposals/'+proposalId+'/stations');
    return response.data;
}
