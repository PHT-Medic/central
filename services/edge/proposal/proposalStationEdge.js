import ResourceApiService from '../../api/resourceApi';

const ProposalStationEdge = {
    addStation: async (data) => {
        const response = await ResourceApiService.post('stations', data);
        return response.data;
    },
    dropStation: async (id) => {
        const response = await ResourceApiService.delete('stations/' + id);
        return response.data;
    },

    //-------------------------------------------------------------

    getStations: async (proposalId) => {
        const response = await ResourceApiService.get('proposals/'+proposalId+'/stations');
        return response.data;
    }
};

export default ProposalStationEdge;

const ProposalStationStateOpen = 'open';
const ProposalStationStateAccepted = 'accepted';
const ProposalStationStateDeclined = 'declined';

const ProposalStationStates = {
    ProposalStationStateOpen,
    ProposalStationStateAccepted,
    ProposalStationStateDeclined
}

export {
    ProposalStationStates
}
