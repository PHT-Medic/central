/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import { getRepository } from 'typeorm';
import {
    REGISTRY_ARTIFACT_TAG_BASE, REGISTRY_ARTIFACT_TAG_LATEST,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    Train,
    TrainManagerQueueCommand,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { TrainRouterCommand, buildTrainRouterQueueMessage } from '../../../special/train-router';
import { findTrain } from './utils';
import { TrainEntity } from '../entity';
import env from '../../../../env';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';

export async function startTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository<Train>(TrainEntity);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (
        !!train.run_status &&
        [TrainRunStatus.STARTING, TrainRunStatus.RUNNING].indexOf(train.run_status) !== -1
    ) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has already been started...');
    } else {
        if (env.trainManagerForRouting) {
            await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.ROUTE, {
                repositoryName: train.id,
                projectName: REGISTRY_INCOMING_PROJECT_NAME,
                operator: REGISTRY_SYSTEM_USER_NAME,
                artifactTag: REGISTRY_ARTIFACT_TAG_BASE,
            }));

            await publishMessage(buildTrainManagerQueueMessage(TrainManagerQueueCommand.ROUTE, {
                repositoryName: train.id,
                projectName: REGISTRY_INCOMING_PROJECT_NAME,
                operator: REGISTRY_SYSTEM_USER_NAME,
                artifactTag: REGISTRY_ARTIFACT_TAG_LATEST,
            }));
        } else {
            const queueMessage = await buildTrainRouterQueueMessage(TrainRouterCommand.START, { id: train.id });

            await publishMessage(queueMessage);
        }

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING,
        });

        await repository.save(train);
    }

    return train;
}
