import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";
import {TrainRunStatus} from "../status";
import {
    createTrainRouterQueueMessageCommand,
    publishTrainRouterQueueMessage
} from "../../../service/train-router/queue";

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
        const queueMessage = await createTrainRouterQueueMessageCommand('stopTrain', {trainId: train.id});

        await publishTrainRouterQueueMessage(queueMessage);

        train = repository.merge(train, {
            run_status: TrainRunStatus.STOPPING
        });

        await repository.save(train);
    }

    return train;
}
