/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message, consumeQueue } from 'amqp-extension';
import { extendDispatcherHarborData } from './data/harbor';
import {
    dispatchHarborEventToEmailNotifier,
    dispatchProposalEventToEmailNotifier,
    dispatchTrainEventToEmailNotifier,
} from './target/email-notifier';
import { dispatchHarborEventToResultService } from './target/result-service';
import { dispatchHarborEventToSelf } from './target/self';
import { dispatchHarborEventToTrainRouter } from './target/train-router';
import { MessageQueueDispatcherRoutingKey } from '../../config/service/mq';

export enum DispatcherEvent {
    PROPOSAL = 'proposalEvent',
    TRAIN = 'trainEvent',
    HARBOR = 'harborEvent',
}

export function buildDispatcherComponent() {
    function start() {
        return consumeQueue({ routingKey: MessageQueueDispatcherRoutingKey.EVENT_OUT }, {
            [DispatcherEvent.PROPOSAL]: async (message: Message) => {
                // assigned, approved, rejected

                await Promise.resolve(message)
                    .then(dispatchProposalEventToEmailNotifier);
            },
            [DispatcherEvent.TRAIN]: async (message: Message) => {
                // assigned, approved, rejected

                await Promise.resolve(message)
                    .then(dispatchTrainEventToEmailNotifier);
            },

            [DispatcherEvent.HARBOR]: async (message: Message) => {
                // PUSH_ARTIFACT

                await Promise.resolve(message)
                    .then(extendDispatcherHarborData)
                    .then(dispatchHarborEventToSelf)
                    .then(dispatchHarborEventToTrainRouter)
                    .then(dispatchHarborEventToResultService)
                    .then(dispatchHarborEventToEmailNotifier)
                    .catch((e) => { console.log(e); throw e; });
            },
        });
    }

    return {
        start,
    };
}
