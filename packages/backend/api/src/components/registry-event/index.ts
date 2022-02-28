/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { extendRegistryData } from './extend';
import { dispatchRegistryEventToResultService } from './target/result-service';
import { dispatchRegistryEventToSelf } from './target/self';
import { dispatchRegistryEventToTrainRouter } from './target/train-router';
import { RegistryQueueEvent } from '../../domains/special/registry';
import { useSpinner } from '../../config/spinner';

async function handleEvent(message: Message) {
    const spinner = useSpinner();

    return Promise.resolve(message)
        .then((message) => {
            spinner.start(`handling ${message.type} event...`);
            return message;
        })
        .then(extendRegistryData)
        .then(dispatchRegistryEventToSelf)
        .then(dispatchRegistryEventToTrainRouter)
        .then(dispatchRegistryEventToResultService)
        .then((message) => {
            spinner.succeed(`handled ${message.type}  event.`);
            return message;
        })
        .catch((e) => {
            spinner.fail(`handling ${message.type}  failed.`);
            throw e;
        });
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
