/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {findHarborProjectRepository, HarborRepository} from "@personalhealthtrain/ui-common";
import {HARBOR_OUTGOING_PROJECT_NAME} from "@personalhealthtrain/ui-common";
import {TrainResultStatus} from "@personalhealthtrain/ui-common";
import {Train} from "@personalhealthtrain/ui-common";
import {TrainRunStatus} from "@personalhealthtrain/ui-common";
import {buildResultServiceQueueMessage, ResultServiceCommand} from "../../../service/result-service";
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
        trainId: train.id,
        latest: true
    }));

    train = repository.merge(train, {
        result_last_status: TrainResultStatus.STARTING
    });

    await repository.save(train);

    return train;
}
