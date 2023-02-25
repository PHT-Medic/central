/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    executeRouterCheckCommand,
    executeRouterRouteCommand,
    executeRouterStartCommand,
} from './commands';
import { RouterCommand } from './constants';
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
import type { RouterCommandContext } from './type';

export async function executeRouterCommand(
    context: RouterCommandContext,
) : Promise<void> {
    switch (context.command) {
        case RouterCommand.CHECK: {
            await Promise.resolve(context.data)
                .then(extendPayload)
                .then((data) => writeCheckingEvent({ data, command: context.command }))
                .then(executeRouterCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));
            break;
        }
        case RouterCommand.ROUTE: {
            await Promise.resolve(context.data)
                .then((data) => writeRoutingEvent({ data, command: context.command }))
                .then(executeRouterRouteCommand)
                .then((data) => writeRoutedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));

            break;
        }
        case RouterCommand.START: {
            await Promise.resolve(extendPayload(context.data))
                .then()
                .then((data) => writeStartingEvent({ data, command: context.command }))
                .then(executeRouterStartCommand)
                .then((data) => writeStartedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    command: context.command,
                    data: context.data,
                    error: err,
                }));
            break;
        }
    }
}
