/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {consumeQueue} from "amqp-extension";
import {createDispatcherAggregatorMasterImageHandlers} from "./handlers/master-image";
import {createDispatcherAggregatorProposalHandlers} from "./handlers/proposal";
import {createDispatcherAggregatorTrainHandlers} from "./handlers/train";
import {MessageQueueDispatcherRoutingKey} from "../../config/service/mq";

export function buildDispatcherAggregator() {
    function start() {
        return consumeQueue({routingKey: MessageQueueDispatcherRoutingKey.EVENT_IN}, {
            ...createDispatcherAggregatorMasterImageHandlers(),
            ...createDispatcherAggregatorProposalHandlers(),
            ...createDispatcherAggregatorTrainHandlers()
        });
    }

    return {
        start
    }
}
