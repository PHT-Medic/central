/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainQueueCommand,
    TrainQueuePayload,
} from '@personalhealthtrain/central-common';
import { getMinioBucketObjectList, useMinio } from '../../../core/minio';
import { generateTrainMinioBucketName } from '../../../domains/core/train';

export async function cleanupTrain(payload: TrainQueuePayload<TrainQueueCommand.CLEANUP>) {
    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        const items = await getMinioBucketObjectList(minio, bucketName);
        await minio.removeObjects(bucketName, items);
        await minio.removeBucket(bucketName);
    }
}
