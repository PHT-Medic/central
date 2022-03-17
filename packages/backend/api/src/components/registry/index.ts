/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { saveToRegistry } from './handlers/save';
import { deleteFromRegistry } from './handlers/delete';
import { RegistryQueueCommand } from '../../domains/special/registry';
import { setupRegistry } from './handlers/setup';

export function createRegistryComponentHandlers() : Record<RegistryQueueCommand, ConsumeHandler> {
    return {
        [RegistryQueueCommand.SAVE]: async (message: Message) => {
            await saveToRegistry(message);
        },
        [RegistryQueueCommand.DELETE]: async (message: Message) => {
            await deleteFromRegistry(message);
        },
        [RegistryQueueCommand.SETUP]: async (message: Message) => {
            await setupRegistry(message);
        },
    };
}
