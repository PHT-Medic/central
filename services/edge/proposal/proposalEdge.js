import ResourceApiService from '../../api/resourceApi';

const ProposalEdge = {
    addProposal: async (data) => {
        const response = await ResourceApiService.post('proposals', data);
        return response.data;
    },

    //--------------------------------------------------------------------

    dropProposal: async (id) => {
        const response = await ResourceApiService.delete('proposals/' + id);
        return response.data;
    },

    //--------------------------------------------------------------------

    editProposal: async (id, data) => {
        const response = await ResourceApiService.post('proposals/out/' + id, data);
        return response.data;
    },

    //--------------------------------------------------------------------

    getProposal: async (data) => {
        const response = await ResourceApiService.get('proposals/' + data.id);
        return response.data;
    },

    //--------------------------------------------------------------------


    getOutProposals: async (data) => {
        const response = await ResourceApiService.get('proposals/out');
        return response.data;
    },
    getInProposals: async (data) => {
        const response = await ResourceApiService.get('proposals/in');
        return response.data;
    }
};

export default ProposalEdge;
