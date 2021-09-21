import {getRepository} from "typeorm";
import {Train} from "../../../domains/pht/train";
import {
    TrainBuildStatus,
    TrainRunStatus
} from "../../../domains/pht/train/status";
import {TrainStation} from "../../../domains/pht/train-station";
import {TrainStationRunStatus} from "../../../domains/pht/train-station/status";
import {QueChannelHandler, QueueMessage} from "../../../modules/message-queue";

export enum AggregatorTrainEvent {
    BUILD_FINISHED = 'trainBuilt',
    STARTED = 'trainStarted',
    MOVED = 'trainMoved',
    FINISHED = 'trainFinished'
}

export function createDispatcherAggregatorTrainHandlers() : Record<string, QueChannelHandler> {
    return {
        [AggregatorTrainEvent.BUILD_FINISHED]: async (message: QueueMessage) => {
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
                run_status: TrainRunStatus.STARTED,
                run_station_id: null
            });
        },
        [AggregatorTrainEvent.MOVED]: async (message: QueueMessage) => {
            const repository = getRepository(Train);

            await repository.update({
                id: message.data.id
            }, {
                run_status: TrainRunStatus.STARTED,
                run_station_id: message.data.stationId
            });

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
                run_status: TrainRunStatus.FINISHED,
                run_station_id: null
            });
        }
    }
}
