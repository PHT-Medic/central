import {publishMessage} from "amqp-extension";
import env from "../../../../env";
import {buildTrainBuilderQueueMessage, TrainBuilderCommand} from "../../../service/train-builder/queue";
import {Train} from "../index";
import {getRepository} from "typeorm";
import {findTrain} from "./utils";

export async function detectTrainBuildStatus(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    if (!env.demo) {
        const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.STATUS, train);

        await publishMessage(queueMessage);
    }

    return train;
}
