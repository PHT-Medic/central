/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainQueueCommand,
    TrainQueuePayload,
} from '@personalhealthtrain/central-common';
import { getMinioBucketObjectList, useMinio } from '../../../core/minio';
import {
    generateTrainFilesMinioBucketName,
    generateTrainResultsMinioBucketName,
} from '../../../domains/core/train-file/path';

export async function cleanupTrain(payload: TrainQueuePayload<TrainQueueCommand.CLEANUP>) {
    const minio = useMinio();

    // Cleanup files
    let bucketName = generateTrainFilesMinioBucketName(payload.id);
    let hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        const items = await getMinioBucketObjectList(minio, bucketName);
        await minio.removeObjects(bucketName, items);
    }

    // Cleanup results
    bucketName = generateTrainResultsMinioBucketName(payload.id);
    hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        const items = await getMinioBucketObjectList(minio, bucketName);
        await minio.removeObjects(bucketName, items);
    }
}
