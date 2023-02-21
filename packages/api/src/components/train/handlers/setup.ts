/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useMinio } from '../../../core/minio';
import { generateTrainMinioBucketName } from '../../../domains/core/train';
import type { TrainCommand } from '../constants';
import type { TrainPayload } from '../type';

export async function setupTrain(payload: TrainPayload<TrainCommand.CLEANUP>) {
    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }
}
