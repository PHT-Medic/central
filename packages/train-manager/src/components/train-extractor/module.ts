/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainManagerExtractorPayload } from '@personalhealthtrain/central-common';
import { TrainManagerExtractorCommand } from '@personalhealthtrain/central-common';
import {
    downloadImage,
    processCheckCommand,
    processExtractCommand,
    writeCheckedEvent,
    writeCheckingEvent,
    writeDownloadedEvent,
    writeDownloadingEvent,
    writeExtractedEvent, writeExtractingEvent,
} from './commands';
import { writeFailedEvent } from './write-failed';
import type { ExtractorError } from './error';
import { extendPayload } from '../utils/train';

export async function executeExtractorCommand(
    command: TrainManagerExtractorCommand,
    message: TrainManagerExtractorPayload<any>,
) : Promise<void> {
    switch (command) {
        case TrainManagerExtractorCommand.CHECK: {
            const eventContext = {
                command: TrainManagerExtractorCommand.CHECK,
            };
            await Promise.resolve(message)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err) => writeFailedEvent(message, {
                    ...eventContext,
                    error: err,
                }));
            break;
        }
        case TrainManagerExtractorCommand.EXTRACT: {
            const eventContext = {
                command: TrainManagerExtractorCommand.EXTRACT,
            };

            await Promise.resolve(message)
                .then(extendPayload)
                .then((data) => writeDownloadingEvent(data, eventContext))
                .then(downloadImage)
                .then((data) => writeDownloadedEvent(data, eventContext))
                .then((data) => writeExtractingEvent(data, eventContext))
                .then(processExtractCommand)
                .then((data) => writeExtractedEvent(data, eventContext))
                .catch((err: ExtractorError) => writeFailedEvent(message, {
                    ...eventContext,
                    error: err,
                }));
        }
    }
}
