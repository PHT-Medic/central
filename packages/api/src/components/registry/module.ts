/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '../../config';
import type { RegistryEventQueuePayload, RegistryQueuePayload } from '../../domains/special/registry';
import { RegistryQueueCommand } from '../../domains/special/registry';
import {
    dispatchRegistryEventToTrainManager,
    linkRegistryProject,
    relinkRegistryProject,
    setupRegistry,
    unlinkRegistryProject,
} from './handlers';
import type { RegistryComponentExecuteContext } from './type';

export async function executeRegistryCommand(context: RegistryComponentExecuteContext) {
    switch (context.command) {
        case RegistryQueueCommand.SETUP: {
            useLogger()
                .info('registry setup initialised', { component: 'registry', id: context.data.id });

            try {
                await setupRegistry(context.data as RegistryQueuePayload<RegistryQueueCommand.SETUP>);

                useLogger()
                    .info('registry setup completed', { component: 'registry', id: context.data.id });
            } catch (e) {
                useLogger()
                    .error('registry setup failed', { component: 'registry', id: context.data.id });
            }
            break;
        }
        case RegistryQueueCommand.DELETE: {
            break;
        }
        case RegistryQueueCommand.PROJECT_LINK: {
            useLogger()
                .info('registry project link initialised', { component: 'registry', id: context.data.id });

            try {
                await linkRegistryProject(context.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_LINK>);

                useLogger()
                    .info('registry project link completed', { component: 'registry', id: context.data.id });
            } catch (e) {
                useLogger()
                    .error('registry project link failed', { component: 'registry', id: context.data.id });
            }
            break;
        }
        case RegistryQueueCommand.PROJECT_UNLINK: {
            useLogger()
                .info('registry project unlink initialised', { component: 'registry', id: context.data.id });

            try {
                await unlinkRegistryProject(context.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_UNLINK>);

                useLogger()
                    .info('registry project unlink completed', { component: 'registry', id: context.data.id });
            } catch (e) {
                useLogger()
                    .error('registry project unlink failed', { component: 'registry', id: context.data.id });
            }
            break;
        }
        case RegistryQueueCommand.PROJECT_RELINK: {
            useLogger()
                .info('registry project relink initialised', { component: 'registry', id: context.data.id });

            try {
                await relinkRegistryProject(context.data as RegistryQueuePayload<RegistryQueueCommand.PROJECT_RELINK>);

                useLogger()
                    .info('registry project relink completed', { component: 'registry', id: context.data.id });
            } catch (e) {
                useLogger()
                    .error('registry project relink failed', { component: 'registry', id: context.data.id });
            }

            break;
        }
        case RegistryQueueCommand.EVENT_HANDLE: {
            await dispatchRegistryEventToTrainManager(context.event, context.data as RegistryEventQueuePayload);
        }
    }
}
