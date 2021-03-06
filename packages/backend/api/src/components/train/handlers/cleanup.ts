/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerQueueCommand, TrainQueueCommand, TrainQueuePayload } from '@personalhealthtrain/central-common';
import fs from 'fs';
import { publishMessage } from 'amqp-extension';
import { getTrainFilesDirectoryPath } from '../../../domains/core/train-file/path';
import { buildTrainManagerQueueMessage } from '../../../domains/special/train-manager';

export async function cleanupTrain(payload: TrainQueuePayload<TrainQueueCommand.CLEANUP>) {
    const trainDirectoryPath = getTrainFilesDirectoryPath(payload.id);

    try {
        await fs.promises.access(trainDirectoryPath);
        await fs.promises.rm(trainDirectoryPath, { recursive: true, force: true });
    } catch (e) {
        // folder does not exist
    }

    const queuePayload = buildTrainManagerQueueMessage(TrainManagerQueueCommand.EXTRACT_CLEANUP, {
        id: payload.id,
    });

    await publishMessage(queuePayload);
}
