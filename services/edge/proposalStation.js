import ApiService from '../api';

const ProposalStationService = {
  addProposal: async (data) => {
    const response = await ApiService.post('proposals', data);
    return response.data;
  },
  getProposal: async (data) => {
    const response = await ApiService.get('proposals/' + data.id);
    return response.data;
  },
  editProposal: async (id, data) => {
    const response = await ApiService.post('proposals/' + id, data);
    return response.data;
  },
  dropProposal: async (id) => {
    const response = await ApiService.delete('proposals/' + id);
    return response.data;
  },
  getMyStationProposals: async (id) => {
    const response = await ApiService.get('my-stati');
    return response.data;
  }
};

export default ProposalStationService;
