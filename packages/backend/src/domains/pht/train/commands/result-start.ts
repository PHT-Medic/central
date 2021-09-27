import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildResultServiceQueueMessage, ResultServiceCommand} from "../../../service/result-service/queue";
import {findHarborProjectRepository, HarborRepository} from "../../../service/harbor/project/repository/api";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../config/services/harbor";
import {TrainResultStatus} from "../../train-result/status";
import {Train} from "../index";
import {TrainRunStatus} from "../status";
import {findTrain} from "./utils";

export async function triggerTrainResultStart(
    train: string | Train,
    harborRepository?: HarborRepository
) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    if(typeof harborRepository === 'undefined') {
        harborRepository = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, train.id);
        if(typeof harborRepository === 'undefined') {
            throw new Error('The train has not arrived at the outgoing station yet...');
        }
    }

    // send queue message
    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.START, {
        trainId: train.id
    }));

    train = repository.merge(train, {
        result_status: TrainResultStatus.STARTING
    });

    await repository.save(train);

    return train;
}
