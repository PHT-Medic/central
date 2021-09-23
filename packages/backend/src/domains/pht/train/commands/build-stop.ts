import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";
import env from "../../../../env";
import {buildTrainBuilderQueueMessage, TrainBuilderCommand} from "../../../service/train-builder/queue";
import {publishQueueMessage} from "../../../../modules/message-queue";
import {TrainBuildStatus} from "../status";

export async function stopBuildTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (!!train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train build can not longer be stopped...');
    } else {
        // if we already send a stop event, we dont send it again... :)
        if(train.build_status !== TrainBuildStatus.STOPPING) {
            if (!env.demo) {
                const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.STOP, train);

                await publishQueueMessage(queueMessage);
            }
        }

        train = repository.merge(train, {
            build_status: train.build_status !== TrainBuildStatus.STOPPING ? TrainBuildStatus.STOPPING : TrainBuildStatus.STOPPED
        });

        await repository.save(train);
    }

    return train;
}
