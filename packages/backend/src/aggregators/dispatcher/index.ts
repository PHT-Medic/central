import {MQ_UI_D_EVENT_ROUTING_KEY} from "../../config/services/rabbitmq";
import {createDispatcherAggregatorMasterImageHandlers} from "./handlers/master-image";
import {createDispatcherAggregatorProposalHandlers} from "./handlers/proposal";
import {createDispatcherAggregatorTrainHandlers} from "./handlers/train";
import {consumeMessageQueue, handleMessageQueueChannel, QueChannelHandler} from "../../modules/message-queue";


function createDispatcherAggregatorHandlers() : Record<string, QueChannelHandler> {
    return {
        ...createDispatcherAggregatorMasterImageHandlers(),
        ...createDispatcherAggregatorProposalHandlers(),
        ...createDispatcherAggregatorTrainHandlers()
    }
}

export function buildDispatcherAggregator() {
    const handlers = createDispatcherAggregatorHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_D_EVENT_ROUTING_KEY, ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                console.log(e);
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
