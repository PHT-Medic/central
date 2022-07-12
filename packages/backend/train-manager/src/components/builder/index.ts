/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { TrainManagerBuilderCommand } from '@personalhealthtrain/central-common';
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
import { extendPayload } from '../utils/train';

export async function executeBuilderCommand(
    command: TrainManagerBuilderCommand,
    message: Message,
) : Promise<void> {
    switch (command) {
        case TrainManagerBuilderCommand.BUILD: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeBuildingEvent)
                .then(processBuildCommand)
                .then(writeBuiltEvent)
                .then(writePushingEvent)
                .then(processPushCommand)
                .then(writePushedEvent)
                .catch((err: Error) => writeFailedEvent(
                    message,
                    err,
                ));
            break;
        }
        case TrainManagerBuilderCommand.CHECK: {
            await Promise.resolve(message)
                .then(extendPayload)
                .then(writeCheckingEvent)
                .then(processCheckCommand)
                .then(writeCheckedEvent)
                .catch((err: Error) => writeFailedEvent(
                    message,
                    err,
                ));
            break;
        }
    }
}
