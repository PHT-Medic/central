import {consumeQueue} from "amqp-extension";
import {MQ_UI_D_EVENT_ROUTING_KEY} from "../../config/services/rabbitmq";
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
