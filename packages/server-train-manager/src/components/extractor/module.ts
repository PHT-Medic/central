/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    executeExtractorCheckCommand,
    executeExtractorDownloadCommand,
    executeExtractorExtractCommand,
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
import type { ExtractorCommandContext } from './type';

export async function executeExtractorCommand(
    context: ExtractorCommandContext,
) : Promise<void> {
    switch (context.command) {
        case ExtractorCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(executeExtractorCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
        case ExtractorCommand.EXTRACT: {
            // todo: download and extract should be named "steps"
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeDownloadingEvent({ data, command: context.command }))
                .then(executeExtractorDownloadCommand)
                .then((data) => writeDownloadedEvent({ data, command: context.command }))
                .then((data) => writeExtractingEvent({ data, command: context.command }))
                .then(executeExtractorExtractCommand)
                .then((data) => writeExtractedEvent({ data, command: context.command }))
                .catch((err) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
        }
    }
}
