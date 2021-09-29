/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useApi} from "@/modules/api";
import {changeResponseKeyCase} from "@/modules/api/utils";

export function getTrainFilesDownloadUri(trainId: number) {
    return 'trains/'+trainId+'/files/download'
}

export async function getApiTrainFiles(trainId: number) {
    const response = await useApi('auth').get('trains/'+trainId+'/files');

    return response.data;
}

export async function getApiTrainFile(trainId: number, fileId: number) {
    try {
        const response = await useApi('auth').get('trains/'+trainId+'/files'+fileId);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Date mit der ID ' + fileId + ' konnte nicht gefunden werden.');
    }
}

export async function dropApiTrainFile(trainId: number, fileId: number) {
    try {
        let response = await useApi('auth').delete('trains/'+trainId+'/files/'+fileId);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Datei konnte nicht gelöscht werden.');
    }
}

export async function uploadTrainFiles(trainId: number, formData: FormData) {
    try {
        const response = await useApi('auth').post('trains/'+trainId+'/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (e) {
        throw new Error('Die Dateien konnten nicht hochgeladen werden.');
    }
}
