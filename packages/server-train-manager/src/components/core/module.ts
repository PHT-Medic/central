/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { extendPayload } from '../utils';
import {
    executeCoreConfigureCommand, executeCoreDestroyCommand,

} from './commands';
import { CoreCommand } from './constants';
import {
    writeConfiguredEvent,
    writeConfiguringEvent,
    writeDestroyedEvent,
    writeDestroyingEvent,
    writeFailedEvent,
} from './events';
import type { CoreCommandContext } from './type';

export async function executeCoreCommand(
    context: CoreCommandContext,
) : Promise<void> {
    switch (context.command) {
        case CoreCommand.CONFIGURE: {
            await Promise.resolve(context.data)
                .then((data) => writeConfiguringEvent({ data, command: context.command }))
                .then(executeCoreConfigureCommand)
                .then((data) => writeConfiguredEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
        case CoreCommand.DESTROY: {
            await Promise.resolve(context.data)
                .then((data) => writeDestroyingEvent({ data, command: context.command }))
                .then(executeCoreDestroyCommand)
                .then((data) => writeDestroyedEvent({ data, command: context.command }))
                .catch((err: Error) => writeFailedEvent({
                    data: context.data,
                    command: context.command,
                    error: err,
                }));
            break;
        }
    }
}
