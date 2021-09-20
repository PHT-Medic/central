import {getRepository} from "typeorm";
import {Train} from "../../../domains/pht/train";
import {
    TrainBuildStatus,
    TrainRunStatus
} from "../../../domains/pht/train/status";
import {QueChannelHandler, QueueMessage} from "../../../modules/message-queue";
import {TrainStation} from "../../../domains/pht/train/station";
import {TrainStationRunStatus} from "../../../domains/pht/train/station/status";

export enum AggregatorTrainEvent {
    BUILT = 'trainBuilt',

    STARTED = 'trainStarted',
    MOVED = 'trainMoved',
    FINISHED = 'trainFinished'
}

export function createDispatcherAggregatorTrainHandlers() : Record<string, QueChannelHandler> {
    return {
        [AggregatorTrainEvent.BUILT]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                build_status: TrainBuildStatus.FINISHED
            });
        },
        [AggregatorTrainEvent.STARTED]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                run_status: TrainRunStatus.STARTED
            });
        },
        [AggregatorTrainEvent.STARTED]: async (message: QueueMessage) => {
            const trainStationRepository = getRepository(TrainStation);
            await trainStationRepository.update({
                train_id: message.data.id,
                station_id: message.data.stationId
            }, {
                run_status: message.data.mode as TrainStationRunStatus
            });
        },
        [AggregatorTrainEvent.FINISHED]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                run_status: TrainRunStatus.FINISHED
            });
        }
    }
}
