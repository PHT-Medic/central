import {useApi} from "~/modules/api";
import {changeResponseKeyCase} from "~/modules/api/utils";

export async function getTrainFiles(trainId: number) {
    try {
        const response = await useApi('resource').get('trains/'+trainId+'/files');

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Dateien konnten nicht geladen werden.');
    }
}

export async function getTrainFile(trainId: number, id: number) {
    try {
        const response = await useApi('resource').get('trains/'+trainId+'/files'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Date mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropTrainFile(trainId: number, id: number) {
    try {
        let response = await useApi('resource').delete('trains/'+trainId+'/files/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Datei konnte nicht gelöscht werden.');
    }
}

export async function uploadTrainFiles(trainId: number, formData: FormData) {
    try {
        const response = await useApi('resource').post('trains/'+trainId+'/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (e) {
        throw new Error('Die Dateien konnten nicht hochgeladen werden.');
    }
}
