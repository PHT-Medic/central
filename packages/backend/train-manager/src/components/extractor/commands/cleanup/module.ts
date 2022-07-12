/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    TrainManagerExtractorCleanupQueuePayload,
} from '@personalhealthtrain/central-common';
import fs from 'fs';
import { buildImageOutputFilePath } from '../../../../config/paths';

export async function cleanupImage(message: Message) {
    const data = message.data as TrainManagerExtractorCleanupQueuePayload;

    // delete result file if it already exists.
    const outputFilePath: string = buildImageOutputFilePath(data.id);

    try {
        await fs.promises.access(outputFilePath, fs.constants.F_OK);
        await fs.promises.unlink(outputFilePath);
    } catch (e) {
        // do nothing :)
    }
}
