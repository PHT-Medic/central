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
    trainId: Train['id'],
): string {
    return `trains/${trainId}/files/download`;
}

export async function getApiTrainFiles(
    trainId: Train['id'],
) : Promise<CollectionResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).get(`trains/${trainId}/files`);

    return response.data;
}

export async function getApiTrainFile(
    trainId: Train['id'],
    fileId: TrainFile['id'],
) : Promise<SingleResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).get(`trains/${trainId}/files/${fileId}`);

    return response.data;
}

export async function dropApiTrainFile(
    trainId: Train['id'],
    fileId: TrainFile['id'],
) : Promise<SingleResourceResponse<TrainFile>> {
    const response = await useAPI(APIType.DEFAULT).delete(`trains/${trainId}/files/${fileId}`);

    return response.data;
}

export async function uploadTrainFiles(
    trainId: Train['id'],
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
