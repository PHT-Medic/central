/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerBuilderCommand, TrainManagerComponent } from '@personalhealthtrain/central-common';
import { extendPayload } from '../utils';
import {
    processBuildCommand,
    processCheckCommand,
    processPushCommand,
    writeBuildingEvent,
    writeBuiltEvent,
    writeCheckedEvent,
    writeCheckingEvent,
    writePushedEvent,
    writePushingEvent,
} from './commands';
import type { TrainBuilderExecutionContext } from './type';
import { writeFailedEvent } from './write-failed';

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
                .catch((err: Error) => writeFailedEvent(
                    context.data,
                    {
                        command: context.command,
                        error: err,
                    },
                ));
            break;
        }
        case TrainManagerBuilderCommand.CHECK: {
            const eventContext = {
                command: TrainManagerBuilderCommand.CHECK,
                component: TrainManagerComponent.BUILDER,
            };

            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(
                    context.data,
                    {
                        ...eventContext,
                        error: err,
                    },
                ));
            break;
        }
    }
}
