/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerComponent, TrainManagerExtractorCommand,
    TrainQueueCommand,
    TrainQueuePayload,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { useMinio } from '../../../core/minio';
import { generateTrainFilesMinioBucketName } from '../../../domains/core/train-file/path';
import { buildTrainManagerQueueMessage } from '../../../domains/special/train-manager';

export async function cleanupTrain(payload: TrainQueuePayload<TrainQueueCommand.CLEANUP>) {
    const minio = useMinio();

    const bucketName = generateTrainFilesMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        const stream = await minio.listObjects(bucketName, undefined, true);
        const items : string[] = [];

        await new Promise<void>((resolve, reject) => {
            stream.on('data', (obj) => {
                items.push(obj.name);
            });

            stream.on('error', (e) => reject(e));

            stream.on('end', () => {
                minio.removeObjects(bucketName, items)
                    .then(() => resolve())
                    .catch((e) => reject(e));
            });
        });
    }

    const queuePayload = buildTrainManagerQueueMessage(
        TrainManagerComponent.EXTRACTOR,
        TrainManagerExtractorCommand.CLEANUP,
        {
            id: payload.id,
        },
    );

    await publishMessage(queuePayload);
}
