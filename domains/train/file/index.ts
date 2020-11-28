import {useApi} from "~/modules/api";
import {changeResponseKeyCase} from "~/modules/api/utils";

export async function getApiTrainFiles(trainId: number) {
    try {
        const response = await useApi('auth').get('pht/trains/'+trainId+'/files');

        return response.data;
    } catch (e) {
        throw new Error('Die Dateien konnten nicht geladen werden.');
    }
}

export async function getApiTrainFile(trainId: number, fileId: number) {
    try {
        const response = await useApi('auth').get('pht/trains/'+trainId+'/files'+fileId);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Date mit der ID ' + fileId + ' konnte nicht gefunden werden.');
    }
}

export async function dropTrainFile(trainId: number, fileId: number) {
    try {
        let response = await useApi('auth').delete('pht/trains/'+trainId+'/files/'+fileId);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Datei konnte nicht gelöscht werden.');
    }
}

export async function uploadTrainFiles(trainId: number, formData: FormData) {
    try {
        const response = await useApi('auth').post('pht/trains/'+trainId+'/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (e) {
        throw new Error('Die Dateien konnten nicht hochgeladen werden.');
    }
}
