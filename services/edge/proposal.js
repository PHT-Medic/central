import ApiService from '../api';

const ProposalApiService = {
  getProposal: async (data) => {
    const response = await ApiService.get('proposals/' + data.id);
    return response.data;
  },
  getProposalTrains: async (data) => {
    const response = await ApiService.get('proposals/' + data.id + '/trains');
    return response.data;
  },

  //--------------------------------------------------------------------

  addProposal: async (data) => {
    const response = await ApiService.post('proposals', data);
    return response.data;
  },

  //--------------------------------------------------------------------

  editProposal: async (id, data) => {
    const response = await ApiService.post('proposals/' + id, data);
    return response.data;
  },

  //--------------------------------------------------------------------

  dropProposal: async (id) => {
    const response = await ApiService.delete('proposals/' + id);
    return response.data;
  },

  //--------------------------------------------------------------------

  getOutProposals: async (data) => {
    const response = await ApiService.get('proposals/out');
    return response.data;
  },
  getInProposals: async (data) => {
    const response = await ApiService.get('proposals/in');
    return response.data;
  }
};

export default ProposalApiService;
