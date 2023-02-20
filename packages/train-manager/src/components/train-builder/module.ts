/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainManagerBuilderBuildPayload,
    TrainManagerBuilderCheckPayload,
    TrainManagerBuilderPayload,
} from '@personalhealthtrain/central-common';
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
import { writeFailedEvent } from './write-failed';

export async function executeBuilderCommand(
    command: TrainManagerBuilderCommand,
    message: TrainManagerBuilderPayload<any>,
) : Promise<void> {
    switch (command) {
        case TrainManagerBuilderCommand.BUILD: {
            const eventContext = {
                command: TrainManagerBuilderCommand.BUILD,
                component: TrainManagerComponent.BUILDER,
            };

            await Promise.resolve(message as TrainManagerBuilderBuildPayload)
                .then(extendPayload)
                .then((data) => writeBuildingEvent(data, eventContext))
                .then(processBuildCommand)
                .then((data) => writeBuiltEvent(data, eventContext))
                .then((data) => writePushingEvent(data, eventContext))
                .then(processPushCommand)
                .then((data) => writePushedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(
                    message,
                    {
                        ...eventContext,
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

            await Promise.resolve(message as TrainManagerBuilderCheckPayload)
                .then(extendPayload)
                .then((data) => writeCheckingEvent(data, eventContext))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent(data, eventContext))
                .catch((err: Error) => writeFailedEvent(
                    message,
                    {
                        ...eventContext,
                        error: err,
                    },
                ));
            break;
        }
    }
}
