import {publishMessage} from "amqp-extension";
import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";
import {TrainRunStatus} from "../status";
import {buildTrainRouterQueueMessage, TrainRouterCommand} from "../../../service/train-router/queue";

export async function stopTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (train.run_status === TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has already been terminated...');
    } else {
        if(train.run_status !== TrainRunStatus.STOPPING) {
            const queueMessage = await buildTrainRouterQueueMessage(TrainRouterCommand.STOP, {trainId: train.id});

            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            run_status: train.run_status !== TrainRunStatus.STOPPING ? TrainRunStatus.STOPPING : TrainRunStatus.STOPPED
        });

        await repository.save(train);
    }

    return train;
}
