/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { RegistryQueueCommand, RegistryQueuePayload } from '../../domains/special/registry';
import { setupRegistry } from './handlers/default';
import { linkRegistryProject, relinkRegistryProject, unlinkRegistryProject } from './handlers/project';

export function createRegistryComponentHandlers() : Record<RegistryQueueCommand, ConsumeHandler> {
    return {
        [RegistryQueueCommand.SETUP]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.SETUP>;

            await setupRegistry(payload);
        },
        [RegistryQueueCommand.DELETE]: async (message: Message) => {
            // tear down registry
        },

        [RegistryQueueCommand.PROJECT_LINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_LINK>;
            await linkRegistryProject(payload);
        },
        [RegistryQueueCommand.PROJECT_UNLINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_UNLINK>;
            await unlinkRegistryProject(payload);
        },
        [RegistryQueueCommand.PROJECT_RELINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_RELINK>;
            await relinkRegistryProject(payload);
        },
    };
}
