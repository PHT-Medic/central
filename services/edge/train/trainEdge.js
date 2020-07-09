import AuthApiService from "../../api/authApi";
import {formatToEdgeRequestObject, parseEdgeResponseObject, parseEdgeResponseObjects} from "../helpers/edgeHelpers";
import ResourceApiService from "../../api/resourceApi";

const TrainEdgeMapping = {
    id: 'id',
    type: 'type',
    hash: 'hash',
    signedHash: 'signed_hash',
    status: 'status',
    proposalId: 'proposal_id',
    masterImageId: 'master_image_id',
    entryPointName: 'entrypoint_name',
    entryPointCommand: 'entrypoint_command',
    stationIds: 'station_ids',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
};

const TrainStateCreated = 'created';
const TrainStateHashGenerated = 'hash_generated';
const TrainStateHashSigned = 'hash_signed';
const TrainStateRunning = 'running';
const TrainStateStopped = 'stopped';
const TrainStateFinished = 'finished';

const TrainStates = {
    TrainStateCreated,
    TrainStateHashGenerated,
    TrainStateHashSigned,
    TrainStateRunning,
    TrainStateStopped,
    TrainStateFinished
};

const TrainEdge = {
    getTrains: async(proposalId) => {
        try {
            let response = await ResourceApiService.get('trains');

            let data = response.data;

            return parseEdgeResponseObjects(data, TrainEdgeMapping);
        } catch (e) {
            throw new Error('Die Züge konnten nicht geladen werden.');
        }
    },

    getTrain: async(id) => {
        try {
            let response = await ResourceApiService.get('trains/'+id);

            let data = response.data;

            return parseEdgeResponseObject(data, TrainEdgeMapping);
        } catch (e) {
            throw new Error('Der Zug mit der ID ' + id + ' konnte nicht gefunden werden.');
        }
    },

    dropTrain: async(id) => {
        try {
            let response = await ResourceApiService.delete('trains/'+id);

            return response.data;
        } catch (e) {
            throw new Error('Die Zug mit der ID ' + id + ' konnte nicht gelöscht werden.');
        }
    },

    editTrain: async (id, data) => {
        data = formatToEdgeRequestObject(data,TrainEdgeMapping);

        try {
            let response = await ResourceApiService.post('trains/'+id ,data);

            return response.data;
        } catch (e) {
            throw new Error('Die Zug konnte nicht bearbeitet werden.');
        }
    },

    addTrain: async (data) => {
        data = formatToEdgeRequestObject(data,TrainEdgeMapping);

        try {
            let response = await ResourceApiService.post('trains',data);

            return response.data;
        } catch (e) {
            throw new Error('Die Zug konnte nicht erstellt werden.');
        }
    },

    doTrainAction: async (id, action) => {
        try {
            let response = await ResourceApiService.get('trains/'+id+'/action/'+action);

            return response.data;
        } catch (e) {
            throw new Error('Die Aktion konnte nicht auf den Zug angewendet werden.');
        }
    }
};

export default TrainEdge;

export {
    TrainEdgeMapping,
    TrainStates
}
