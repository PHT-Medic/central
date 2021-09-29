import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {Train} from "@personalhealthtrain/ui-common";
import {buildTrainBuilderQueueMessage} from "../../../service/train-builder/queue";
import {TrainBuilderCommand} from "../../../service/train-builder/type";
import {findTrain} from "./utils";

export async function detectTrainBuildStatus(train: Train | number | string, demo: boolean = false) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        throw new Error('The train could not be found.');
    }

    if (!demo) {
        const queueMessage = await buildTrainBuilderQueueMessage(TrainBuilderCommand.STATUS, train);

        await publishMessage(queueMessage);
    }

    return train;
}
