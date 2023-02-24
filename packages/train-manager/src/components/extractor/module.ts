/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    downloadImage,
    processCheckCommand,
    processExtractCommand,
} from './commands';
import { ExtractorCommand } from './constants';
import {
    writeCheckedEvent,
    writeCheckingEvent,
    writeDownloadedEvent,
    writeDownloadingEvent,
    writeExtractedEvent,
    writeExtractingEvent,
    writeFailedEvent,
} from './events';
import { extendPayload } from '../utils';
import type { ExtractorExecutionContext } from './type';

export async function executeExtractorCommand(
    context: ExtractorExecutionContext,
) : Promise<void> {
    switch (context.command) {
        case ExtractorCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
        case ExtractorCommand.EXTRACT: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeDownloadingEvent({ data, command: context.command }))
                .then(downloadImage)
                .then((data) => writeDownloadedEvent({ data, command: context.command }))
                .then((data) => writeExtractingEvent({ data, command: context.command }))
                .then(processExtractCommand)
                .then((data) => writeExtractedEvent({ data, command: context.command }))
                .catch((err) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
        }
    }
}
