import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";
import {
    createTrainRouterQueueMessageCommand,
    publishTrainRouterQueueMessage
} from "../../../service/train-router/queue";
import {TrainRunStatus} from "../status";

export async function startTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (!!train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has already been started...');
    } else {
        const queueMessage = await createTrainRouterQueueMessageCommand('startTrain', {trainId: train.id});

        await publishTrainRouterQueueMessage(queueMessage);

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING
        });

        await repository.save(train);
    }

    return train;
}
