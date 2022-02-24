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

export function createRegistryEventHandlers() : Record<string, ConsumeHandler> {
    return {
        [RegistryQueueEvent.PUSH_ARTIFACT]: async (message: Message) => {
            await Promise.resolve(message)
                .then(extendRegistryData)
                .then(dispatchRegistryEventToSelf)
                .then(dispatchRegistryEventToTrainRouter)
                .then(dispatchRegistryEventToResultService)
                .catch((e) => { console.log(e); throw e; });
        },
    };
}
