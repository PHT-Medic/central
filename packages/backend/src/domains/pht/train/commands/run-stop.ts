/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Train, TrainRunStatus} from "@personalhealthtrain/ui-common";
import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildTrainRouterQueueMessage, TrainRouterCommand} from "../../../service/train-router";
import {findTrain} from "./utils";

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
