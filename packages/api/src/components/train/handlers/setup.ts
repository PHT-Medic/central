/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainQueueCommand, TrainQueuePayload } from '@personalhealthtrain/central-common';
import { useMinio } from '../../../core/minio';
import { generateTrainMinioBucketName } from '../../../domains/core/train';

export async function setupTrain(payload: TrainQueuePayload<TrainQueueCommand.CLEANUP>) {
    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }
}
