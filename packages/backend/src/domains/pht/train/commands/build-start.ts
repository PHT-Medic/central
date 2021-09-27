import {publishMessage} from "amqp-extension";
import {getRepository, Not} from "typeorm";
import env from "../../../../env";
import {buildTrainBuilderQueueMessage, TrainBuilderCommand} from "../../../service/train-builder/queue";
import {TrainResultStatus} from "../../train-result/status";
import {TrainStation} from "../../train-station";
import {TrainStationApprovalStatus} from "../../train-station/status";
import {Train} from "../index";
import {TrainBuildStatus, TrainConfigurationStatus, TrainRunStatus} from "../status";
import {findTrain} from "./utils";

export async function startBuildTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (!!train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train can not longer be build...');
    } else {
        if(!env.demo) {
            const trainStationRepository = getRepository(TrainStation);
            const trainStations = await trainStationRepository.find({
                train_id: train.id,
                approval_status: Not(TrainStationApprovalStatus.APPROVED)
            });

            if (trainStations.length > 0) {
                // todo: make it a ClientError.NotFound
                throw new Error('Not all stations have approved the train yet.');
            }

            const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.START, train);

            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            configuration_status: TrainConfigurationStatus.FINISHED,
            run_status: env.demo ? TrainRunStatus.FINISHED : null,
            build_status: env.demo ? null : TrainBuildStatus.STARTING,
            result_status: env.demo ? TrainResultStatus.FINISHED : null
        });

        await repository.save(train);
    }

    return train;
}
