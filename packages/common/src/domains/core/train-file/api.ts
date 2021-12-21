/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    APIType, CollectionResourceResponse, SingleResourceResponse, useAPI,
} from '../../../modules';
import { Train } from '../train';
import { TrainFile } from './entity';

export function getAPITrainFilesDownloadUri(
    trainId: typeof Train.prototype.id,
): string {
    return `trains/${trainId}/files/download`;
}

export async function getApiTrainFiles(
    trainId: typeof Train.prototype.id,
) : Promise<CollectionResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).get(`trains/${trainId}/files`);

    return response.data;
}

export async function getApiTrainFile(
    trainId: typeof Train.prototype.id,
    fileId: typeof TrainFile.prototype.id,
) : Promise<SingleResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).get(`trains/${trainId}/files/${fileId}`);

    return response.data;
}

export async function dropApiTrainFile(
    trainId: typeof Train.prototype.id,
    fileId: typeof Train.prototype.id,
) : Promise<SingleResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).delete(`trains/${trainId}/files/${fileId}`);

    return response.data;
}

export async function uploadTrainFiles(
    trainId: typeof Train.prototype.id,
    formData: any,
) : Promise<CollectionResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).post(`trains/${trainId}/files`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
    });

    return response.data;
}
