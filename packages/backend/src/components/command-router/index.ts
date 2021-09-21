import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "../../config/services/rabbitmq";
import {createServiceSecurityComponentHandlers} from "../service-security";

import {
    consumeMessageQueue,
    handleMessageQueueChannel,
    QueChannelHandler
} from "../../modules/message-queue";

function createCommandRouterHandlers() : Record<string, QueChannelHandler> {
    return {
        ...createServiceSecurityComponentHandlers()
    }
}

export function buildCommandRouterComponent() {
    const handlers = createCommandRouterHandlers();

    function start() {
        return consumeMessageQueue(MQ_UI_SELF_COMMAND_ROUTING_KEY, ((async (channel, msg) => {
            try {
                await handleMessageQueueChannel(channel, handlers, msg);
                await channel.ack(msg);
            } catch (e) {
                await channel.reject(msg, false);
            }
        })));
    }

    return {
        start
    }
}
