/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainManagerExtractorCheckQueuePayload,
    TrainManagerExtractorExtractQueuePayload,
} from '@personalhealthtrain/central-common';
import { TrainManagerComponent, TrainManagerExtractorCommand } from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
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
import { extendPayload } from '../utils';

type ExecutionContext = ComponentExecutionContext<TrainManagerExtractorCommand.CHECK, TrainManagerExtractorCheckQueuePayload> |
ComponentExecutionContext<TrainManagerExtractorCommand.EXTRACT, TrainManagerExtractorExtractQueuePayload>;

export async function executeExtractorCommand(
    context: ExecutionContext,
) : Promise<void> {
    const eventContext = {
        command: context.command,
        component: TrainManagerComponent.EXTRACTOR,
    };

    switch (context.command) {
        case TrainManagerExtractorCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err) => writeFailedEvent(context.data, {
                    ...eventContext,
                    error: err,
                }));
            break;
        }
        case TrainManagerExtractorCommand.EXTRACT: {
            const eventContext = {
                command: TrainManagerExtractorCommand.EXTRACT,
            };

            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeDownloadingEvent(data, eventContext))
                .then(downloadImage)
                .then((data) => writeDownloadedEvent(data, eventContext))
                .then((data) => writeExtractingEvent(data, eventContext))
                .then(processExtractCommand)
                .then((data) => writeExtractedEvent(data, eventContext))
                .catch((err: ExtractorError) => writeFailedEvent(context.data, {
                    ...eventContext,
                    error: err,
                }));
        }
    }
}
