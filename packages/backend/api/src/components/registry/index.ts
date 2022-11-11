/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { useLogger } from '../../config';
import { RegistryQueueCommand, RegistryQueuePayload } from '../../domains/special/registry';
import { setupRegistry } from './handlers/default';
import { linkRegistryProject, relinkRegistryProject, unlinkRegistryProject } from './handlers/project';

export function createRegistryComponentHandlers() : Record<RegistryQueueCommand, ConsumeHandler> {
    return {
        [RegistryQueueCommand.SETUP]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.SETUP>;

            useLogger()
                .info('registry setup initialised', { component: 'registry', id: payload.id });

            try {
                await setupRegistry(payload);

                useLogger()
                    .info('registry setup completed', { component: 'registry', id: payload.id });
            } catch (e) {
                console.log(e);

                useLogger()
                    .error('registry setup failed', { component: 'registry', id: payload.id });
            }
        },
        [RegistryQueueCommand.DELETE]: async (message: Message) => {
            // tear down registry
        },

        [RegistryQueueCommand.PROJECT_LINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_LINK>;

            useLogger()
                .info('registry project link initialised', { component: 'registry', id: payload.id });

            try {
                await linkRegistryProject(payload);

                useLogger()
                    .info('registry project link completed', { component: 'registry', id: payload.id });
            } catch (e) {
                console.log(e);

                useLogger()
                    .error('registry project link failed', { component: 'registry', id: payload.id });
            }
        },
        [RegistryQueueCommand.PROJECT_UNLINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_UNLINK>;

            useLogger()
                .info('registry project unlink initialised', { component: 'registry', id: payload.id });

            try {
                await unlinkRegistryProject(payload);

                useLogger()
                    .info('registry project unlink completed', { component: 'registry', id: payload.id });
            } catch (e) {
                console.log(e);

                useLogger()
                    .error('registry project unlink failed', { component: 'registry', id: payload.id });
            }
        },
        [RegistryQueueCommand.PROJECT_RELINK]: async (message: Message) => {
            const payload = message.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_RELINK>;

            useLogger()
                .info('registry project relink initialised', { component: 'registry', id: payload.id });

            try {
                await relinkRegistryProject(payload);

                useLogger()
                    .info('registry project relink completed', { component: 'registry', id: payload.id });
            } catch (e) {
                console.log(e);

                useLogger()
                    .error('registry project relink failed', { component: 'registry', id: payload.id });
            }
        },
    };
}
