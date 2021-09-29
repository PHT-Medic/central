/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {consumeQueue} from "amqp-extension";
import {MQ_UI_D_EVENT_ROUTING_KEY} from "@personalhealthtrain/ui-common";
import {createDispatcherAggregatorMasterImageHandlers} from "./handlers/master-image";
import {createDispatcherAggregatorProposalHandlers} from "./handlers/proposal";
import {createDispatcherAggregatorTrainHandlers} from "./handlers/train";

export function buildDispatcherAggregator() {
    function start() {
        return consumeQueue({routingKey: MQ_UI_D_EVENT_ROUTING_KEY}, {
            ...createDispatcherAggregatorMasterImageHandlers(),
            ...createDispatcherAggregatorProposalHandlers(),
            ...createDispatcherAggregatorTrainHandlers()
        });
    }

    return {
        start
    }
}
