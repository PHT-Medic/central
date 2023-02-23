/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerBuilderCommand } from '@personalhealthtrain/central-common';
import { extendPayload } from '../utils';
import {
    processBuildCommand,
    processCheckCommand,
    processPushCommand,
} from './commands';
import {
    writeBuildingEvent,
    writeBuiltEvent,
    writeCheckedEvent,
    writeCheckingEvent,
    writeFailedEvent,
    writePushedEvent,
    writePushingEvent,
} from './events';
import type { TrainBuilderExecutionContext } from './type';

export async function executeBuilderCommand(
    context: TrainBuilderExecutionContext,
) : Promise<void> {
    switch (context.command) {
        case TrainManagerBuilderCommand.BUILD: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeBuildingEvent({ data, command: context.command }))
                .then(processBuildCommand)
                .then((data) => writeBuiltEvent({ data, command: context.command }))
                .then((data) => writePushingEvent({ data, command: context.command }))
                .then(processPushCommand)
                .then((data) => writePushedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
        case TrainManagerBuilderCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
    }
}
