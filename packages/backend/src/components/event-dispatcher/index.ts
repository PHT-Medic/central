import {consumeQueue, Message} from "amqp-extension";
import {MQ_DISPATCHER_ROUTING_KEY} from "@personalhealthtrain/ui-common";
import {extendDispatcherHarborData} from "./data/harbor";
import {
    dispatchHarborEventToEmailNotifier,
    dispatchProposalEventToEmailNotifier,
    dispatchTrainEventToEmailNotifier
} from "./target/email-notifier";
import {dispatchHarborEventToResultService} from "./target/result-service";
import {dispatchHarborEventToSelf} from "./target/self";
import {dispatchHarborEventToTrainRouter} from "./target/train-router";

export enum DispatcherEvent {
    PROPOSAL = 'proposalEvent',
    TRAIN = 'trainEvent',
    HARBOR = 'harborEvent'
}

export function buildDispatcherComponent() {
    function start() {
        return consumeQueue({routingKey: MQ_DISPATCHER_ROUTING_KEY},{
            [DispatcherEvent.PROPOSAL]: async(message: Message) => {
                // assigned, approved, rejected

                console.log(message);

                await Promise.resolve(message)
                    .then(dispatchProposalEventToEmailNotifier);
            },
            [DispatcherEvent.TRAIN]: async(message: Message) => {
                // assigned, approved, rejected

                console.log(message);

                await Promise.resolve(message)
                    .then(dispatchTrainEventToEmailNotifier);
            },

            [DispatcherEvent.HARBOR]: async(message: Message) => {
                // PUSH_ARTIFACT

                await Promise.resolve(message)
                    .then(extendDispatcherHarborData)
                    .then(dispatchHarborEventToSelf)
                    .then(dispatchHarborEventToTrainRouter)
                    .then(dispatchHarborEventToResultService)
                    .then(dispatchHarborEventToEmailNotifier);
            }
        });
    }

    return {
        start
    }
}
