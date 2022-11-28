/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { TrainManagerExtractorCommand } from '@personalhealthtrain/central-common';
import {
    downloadImage,
    processCheckCommand,
    processExtractCommand,
    writeDownloadedEvent,
    writeDownloadingEvent,
    writeExtractedEvent,
    writeExtractingEvent,
} from './commands';
import { writeFailedEvent } from './write-failed';
import { ExtractorError } from './error';
import { extendPayload } from '../utils/train';
import { writeCheckingEvent } from './commands/check/write-checking';
import { writeCheckedEvent } from './commands/check/write-checked';

export async function executeExtractorCommand(
    command: TrainManagerExtractorCommand,
    message: Message,
) : Promise<void> {
    switch (command) {
        case TrainManagerExtractorCommand.CHECK: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeCheckingEvent)
                .then(processCheckCommand)
                .then(writeCheckedEvent)
                .catch((err) => writeFailedEvent(message, err));
            break;
        }
        case TrainManagerExtractorCommand.EXTRACT: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeExtractingEvent)
                .then(processExtractCommand)
                .then(writeExtractedEvent)
                .catch((err: ExtractorError) => writeFailedEvent(message, err));
        }
    }
}
