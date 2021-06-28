import {
    consumeMessageQueue,
    handleMessageQueueChannel,
    QueChannelHandler,
    QueueMessage
} from "../../modules/message-queue";
import {syncServiceSecurity} from "./sync";
import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "../../config/rabbitmq";

function createServiceSecurityComponentHandlers() : Record<string, QueChannelHandler> {
    return {
        sync: async (message: QueueMessage) => {
            return Promise.resolve(message)
                .then(syncServiceSecurity)
                .catch(e => console.log(e));
        }
    }
}

export function buildServiceSecurityComponent() {
    const handlers = createServiceSecurityComponentHandlers();

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
