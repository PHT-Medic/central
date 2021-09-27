import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildResultServiceQueueMessage, ResultServiceCommand} from "../../../service/result-service/queue";
import {HarborRepository} from "../../../service/harbor/project/repository/api";
import {Train} from "../index";
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
