/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { processExtractCommand } from './process';
import { writeProcessedEvent } from './write-processed';
import { writeProcessingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { writeDownloadingEvent } from './write-downloading';
import { downloadImage } from './download';
import { writeDownloadedEvent } from './write-downloaded';
import { ExtractingError } from './error';
import { processExtractStatusCommand } from './status';
import { resolveTrainRegistry } from '../utils/train-registry';

export function createExtractingComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.EXTRACT]: async (message: Message) => {
            useLogger().debug('process event received', {
                component: 'image-extracting',
            });

            await Promise.resolve(message)
                .then(resolveTrainRegistry)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeProcessingEvent)
                .then(processExtractCommand)
                .then(writeProcessedEvent)
                .catch((err: ExtractingError) => writeFailedEvent(message, err));
        },
        [TrainManagerQueueCommand.EXTRACT_STATUS]: async (message: Message) => {
            useLogger().debug('status event received', {
                component: 'image-extracting',
            });

            await Promise.resolve(message)
                .then(resolveTrainRegistry)
                .then(processExtractStatusCommand)
                .catch((err) => writeFailedEvent(message, err));
        },
    };
}
