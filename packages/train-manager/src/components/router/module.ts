/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainManagerRouterRoutePayload,
    TrainManagerRouterStartPayload,
    TrainManagerRouterStatusPayload,
} from '@personalhealthtrain/central-common';
import { TrainManagerRouterCommand } from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import {
    processCheckCommand,
    processRouteCommand,
    processStartCommand,
} from './commands';
import {
    writeCheckedEvent,
    writeCheckingEvent,
    writeFailedEvent,
    writeRoutedEvent,
    writeRoutingEvent,
    writeStartedEvent,
    writeStartingEvent,
} from './events';
import { extendPayload } from '../utils';

type ExecutionContext = ComponentExecutionContext<TrainManagerRouterCommand.CHECK, TrainManagerRouterStatusPayload> |
ComponentExecutionContext<TrainManagerRouterCommand.ROUTE, TrainManagerRouterRoutePayload> |
ComponentExecutionContext<TrainManagerRouterCommand.START, TrainManagerRouterStartPayload>;

export async function executeRouterCommand(
    context: ExecutionContext,
) : Promise<void> {
    switch (context.command) {
        case TrainManagerRouterCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(processCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));
            break;
        }
        case TrainManagerRouterCommand.ROUTE: {
            const eventContext = {
                command: TrainManagerRouterCommand.ROUTE,
            };

            await Promise.resolve(context.data)
                .then((data) => writeRoutingEvent({ data, command: context.command }))
                .then(processRouteCommand)
                .then((data) => writeRoutedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));

            break;
        }
        case TrainManagerRouterCommand.START: {
            const eventContext = {
                command: TrainManagerRouterCommand.START,
            };

            await Promise.resolve(extendPayload(context.data))
                .then()
                .then((data) => writeStartingEvent({ data, command: context.command }))
                .then(processStartCommand)
                .then((data) => writeStartedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));
        }
    }
}
