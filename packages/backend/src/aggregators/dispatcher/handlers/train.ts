import {getRepository} from "typeorm";
import {Train} from "../../../domains/pht/train";
import {TrainStateFinished, TrainStateStarted} from "../../../domains/pht/train/states";
import {QueChannelHandler, QueueMessage} from "../../../modules/message-queue";

export type AggregatorTrainEventType =
    'trainCreated' | // not implemented yet
    'trainUpdated' | // not implemented yet
    'trainDeleted' | // not implemented yet

    'trainStarted' |
    'trainFinished' |
    'trainBuilt' |
    'trainFailed'; // not implemented yet

export const AggregatorTrainFinishedEvent : AggregatorTrainEventType = 'trainFinished';
export const AggregatorTrainStartedEvent : AggregatorTrainEventType = 'trainStarted';
export const AggregatorTrainBuiltEvent : AggregatorTrainEventType = 'trainBuilt';

export function createDispatcherAggregatorTrainHandlers() : Record<string, QueChannelHandler> {
    return {
        [AggregatorTrainBuiltEvent]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                status: AggregatorTrainBuiltEvent
            });
        },
        [AggregatorTrainStartedEvent]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                status: TrainStateStarted
            });
        },
        [AggregatorTrainFinishedEvent]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                status: TrainStateFinished
            });
        }
    }
}
