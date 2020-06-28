import ResourceApiService from '../../api/resourceApi';
import {formatToEdgeRequestObject, parseEdgeResponseObject, parseEdgeResponseObjects} from "../helpers/edgeHelpers";

const ProposalEdgeMapping = {
    id: 'id',
    title: 'title',
    requestedData: 'requested_data',
    risk: 'risk',
    riskComment: 'risk_comment',
    masterImageId: 'master_image_id',
    userId: 'user_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    stationsTotal: 'stations_total',
    stationIds: 'station_ids'
};

const ProposalEdge = {
    addProposal: async (data) => {
        data = formatToEdgeRequestObject(data,ProposalEdgeMapping);

        try {
            const response = await ResourceApiService.post('proposals', data);
            return response.data;
        } catch (e) {
            throw new Error('Der Antrag konnte nicht erstellt werden.');
        }
    },

    //--------------------------------------------------------------------

    dropProposal: async (id) => {
        try {
            const response = await ResourceApiService.delete('proposals/' + id);
            return response.data;
        } catch (e) {
            throw new Error('Der Antrag konnte nicht gelöscht werden.');
        }
    },

    //--------------------------------------------------------------------

    editProposal: async (id, data) => {
        const response = await ResourceApiService.post('proposals/' + id, data);
        return response.data;
    },

    //--------------------------------------------------------------------

    getProposal: async (id) => {
        try {
            const response = await ResourceApiService.get('proposals/' + id);

            return parseEdgeResponseObject(response.data,ProposalEdgeMapping);
        } catch (e) {
            console.log(e);
            throw new Error('Der Antrag konnte nicht gefunden werden.');
        }
    },

    //--------------------------------------------------------------------


    getOutProposals: async (data) => {
        const response = await ResourceApiService.get('proposals/out');
        return parseEdgeResponseObjects(response.data,ProposalEdgeMapping);
    },
    getInProposals: async (data) => {
        const response = await ResourceApiService.get('proposals/in');
        return parseEdgeResponseObjects(response.data,ProposalEdgeMapping);
    }
};

export default ProposalEdge;
export {
    ProposalEdgeMapping
}
