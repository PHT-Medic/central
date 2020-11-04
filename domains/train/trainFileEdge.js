import AuthApiService from "../../services/api/authApi";
import {formatToEdgeRequestObject, parseEdgeResponseObject, parseEdgeResponseObjects} from "../../services/edge/helpers/edgeHelpers";
import ResourceApiService from "../../services/api/resourceApi";

const TrainFileEdgeMapping = {
    id: 'id',
    name: 'name',
    content: 'content',
};

const TrainFileEdge = {
    getFiles: async(trainId) => {
        try {
            let response = await ResourceApiService.get('trains/'+trainId+'/files');

            let data = response.data;

            return parseEdgeResponseObjects(data, TrainFileEdgeMapping);
        } catch (e) {
            throw new Error('Die Dateien konnten nicht geladen werden.');
        }
    },

    getFile: async(trainId, id) => {
        try {
            let response = await ResourceApiService.get('trains/'+trainId+'/files'+id);

            let data = response.data;

            return parseEdgeResponseObject(data, TrainFileEdgeMapping);
        } catch (e) {
            throw new Error('Der Date mit der ID ' + id + ' konnte nicht gefunden werden.');
        }
    },

    dropFile: async(trainId, id) => {
        try {
            let response = await ResourceApiService.delete('trains/'+trainId+'/files/'+id);

            return response.data;
        } catch (e) {
            throw new Error('Die Datei konnte nicht gelöscht werden.');
        }
    },

    uploadFiles: async(trainId, formData) => {
        try {
            let response = await ResourceApiService.post('trains/'+trainId+'/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (e) {
            throw new Error('Die Dateien konnten nicht hochgeladen werden.');
        }
    }
};

export default TrainFileEdge;
