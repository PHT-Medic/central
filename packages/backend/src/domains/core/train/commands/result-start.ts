/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import {
    HarborAPI,
    HarborRepository,
    REGISTRY_OUTGOING_PROJECT_NAME,
    Train,
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/ui-common';
import { useTrapiClient } from '@trapi/client';
import { ResultServiceCommand, buildResultServiceQueueMessage } from '../../../extra/result-service';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';
import { ApiKey } from '../../../../config/api';

export async function triggerTrainResultStart(
    train: string | Train,
    harborRepository?: HarborRepository,
) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has not finished yet...');
    }

    if (typeof harborRepository === 'undefined') {
        harborRepository = await useTrapiClient<HarborAPI>(ApiKey.HARBOR).projectRepository.find(REGISTRY_OUTGOING_PROJECT_NAME, train.id);
        if (typeof harborRepository === 'undefined') {
            throw new Error('The train has not arrived at the outgoing station yet...');
        }
    }

    // send queue message
    await publishMessage(buildResultServiceQueueMessage(ResultServiceCommand.START, {
        trainId: train.id,
        latest: true,
    }));

    train = repository.merge(train, {
        result_last_status: TrainResultStatus.STARTING,
    });

    await repository.save(train);

    return train;
}
