import {MQ_DISPATCHER_ROUTING_KEY} from "../../config/services/rabbitmq";
import {
    consumeMessageQueue,
    handleMessageQueueChannel,
    QueChannelHandler,
    QueueMessage
} from "../../modules/message-queue";
import {extendDispatcherHarborData} from "./data/harbor";
import {
    dispatchHarborEventToEmailNotifier,
    dispatchProposalEventToEmailNotifier,
    dispatchTrainEventToEmailNotifier
} from "./target/email-notifier";
import {dispatchHarborEventToResultService} from "./target/result-service";
import {dispatchHarborEventToSelf} from "./target/self";
import {dispatchHarborEventToTrainRouter} from "./target/train-router";

export type DispatcherEventType = 'proposalEvent' | 'trainEvent' | 'harborEvent';

export const DispatcherProposalEvent : DispatcherEventType = 'proposalEvent';
export const DispatcherTrainEvent : DispatcherEventType = 'trainEvent';
export const DispatcherHarborEvent : DispatcherEventType = 'harborEvent';

function createDispatcherHandlers() : Record<string, QueChannelHandler> {
    return {
        [DispatcherProposalEvent]: async(message: QueueMessage) => {
            // assigned, approved, rejected

            return Promise.resolve(message)
                .then(dispatchProposalEventToEmailNotifier);
        },
        [DispatcherTrainEvent]: async(message: QueueMessage) => {
            // assigned, approved, rejected

            return Promise.resolve(message)
                .then(dispatchTrainEventToEmailNotifier);
        },

        [DispatcherHarborEvent]: async(message: QueueMessage) => {
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
