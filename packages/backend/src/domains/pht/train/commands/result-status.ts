import {Train} from "@personalhealthtrain/ui-common";
import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildResultServiceQueueMessage, ResultServiceCommand} from "../../../service/result-service";
import {findTrain} from "./utils";

export async function triggerTrainResultStatus(
    train: string | Train
) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    // send queue message
    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.STATUS, {
        trainId: train.id
    }));

    return train;
}
