import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildResultServiceQueueMessage, ResultServiceCommand} from "../../../service/result-service/queue";
import {TrainResultStatus} from "../../train-result/status";
import {Train} from "../index";
import {TrainRunStatus} from "../status";
import {findTrain} from "./utils";

export async function triggerTrainResultStop(
    train: string | Train,
) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    if(train.result_status !== TrainResultStatus.STOPPING) {
        // send queue message
        await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.STOP, {
            trainId: train.id
        }));
    }

    train = repository.merge(train, {
        result_status: train.result_status !== TrainResultStatus.STOPPING ? TrainResultStatus.STOPPING : TrainResultStatus.STOPPED
    });

    await repository.save(train);

    return train;
}
