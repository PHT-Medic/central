import {MQ_DISPATCHER_ROUTING_KEY} from "../../config/services/rabbitmq";
import {extendDispatcherHarborData} from "./data/harbor";
import {
    dispatchHarborEventToEmailNotifier,
    dispatchProposalEventToEmailNotifier,
    dispatchTrainEventToEmailNotifier
} from "./target/email-notifier";
import {dispatchHarborEventToResultService} from "./target/result-service";
import {dispatchHarborEventToSelf} from "./target/self";
import {dispatchHarborEventToTrainRouter} from "./target/train-router";
import {
    consumeMessageQueue,
    handleMessageQueueChannel,
    QueChannelHandler,
    QueueMessage
} from "../../modules/message-queue";

export enum DispatcherEvent {
    PROPOSAL = 'proposalEvent',
    TRAIN = 'trainEvent',
    HARBOR = 'harborEvent'
}

function createDispatcherHandlers() : Record<DispatcherEvent, QueChannelHandler> {
    return {
        [DispatcherEvent.PROPOSAL]: async(message: QueueMessage) => {
            // assigned, approved, rejected

            console.log(message);

            return Promise.resolve(message)
                .then(dispatchProposalEventToEmailNotifier);
        },
        [DispatcherEvent.TRAIN]: async(message: QueueMessage) => {
            // assigned, approved, rejected

            console.log(message);

            return Promise.resolve(message)
                .then(dispatchTrainEventToEmailNotifier);
        },

        [DispatcherEvent.HARBOR]: async(message: QueueMessage) => {
            // PUSH_ARTIFACT

            return Promise.resolve(message)
                .then(extendDispatcherHarborData)
                .then(dispatchHarborEventToSelf)
                .then(dispatchHarborEventToTrainRouter)
                .then(dispatchHarborEventToResultService)
                .then(dispatchHarborEventToEmailNotifier);
        }
    }
}

export function buildDispatcherComponent() {
    const handlers = createDispatcherHandlers();

    function start() {
        return consumeMessageQueue(MQ_DISPATCHER_ROUTING_KEY, ((async (channel, msg) => {
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
