/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { dispatchRegistryEventToTrainManager } from './train-manager';
import { RegistryQueueEvent } from '../../domains/special/registry';

async function handleEvent(message: Message) {
    return Promise.resolve(message)
        .then(dispatchRegistryEventToTrainManager);
}

export function createRegistryEventHandlers() : Record<string, ConsumeHandler> {
    return {
        [RegistryQueueEvent.PUSH_ARTIFACT]: async (message: Message) => {
            await handleEvent(message);
        },
        [RegistryQueueEvent.DELETE_ARTIFACT]: async (message: Message) => {
            await handleEvent(message);
        },
        [RegistryQueueEvent.PULL_ARTIFACT]: async (message: Message) => {
            await handleEvent(message);
        },

        [RegistryQueueEvent.QUOTA_EXCEED]: async (message: Message) => {
            await handleEvent(message);
        },
        [RegistryQueueEvent.QUOTA_WARNING]: async (message: Message) => {
            await handleEvent(message);
        },

        [RegistryQueueEvent.SCANNING_COMPLETED]: async (message: Message) => {
            await handleEvent(message);
        },
        [RegistryQueueEvent.SCANNING_FAILED]: async (message: Message) => {
            await handleEvent(message);
        },
    };
}
