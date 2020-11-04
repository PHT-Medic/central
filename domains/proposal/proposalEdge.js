import ResourceApiService from '../../services/api/resourceApi';
import {formatToEdgeRequestObject, parseEdgeResponseObject, parseEdgeResponseObjects} from "../../services/edge/helpers/edgeHelpers";

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
        try {
            data = formatToEdgeRequestObject(data,ProposalEdgeMapping);

            const response = await ResourceApiService.post('proposals', data);
            return response.data;
        } catch (e) {
            throw new Error('Der Antrag konnte nicht erstellt werden.');
        }
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
