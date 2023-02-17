/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { publishMessage } from 'amqp-extension';
import {
    TrainContainerPath,
    TrainManagerComponent,
    TrainManagerExtractorCommand,
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStart(
    train: string | TrainEntity,
) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    if (train.run_status !== TrainRunStatus.FINISHED) {
        throw new BadRequestError('The train has not finished yet...');
    }

    // send queue message
    await publishMessage(buildTrainManagerQueueMessage(
        TrainManagerComponent.EXTRACTOR,
        TrainManagerExtractorCommand.EXTRACT,
        {
            id: train.id,

            filePaths: [
                TrainContainerPath.RESULTS,
                TrainContainerPath.CONFIG,
            ],
        },
    ));

    train = repository.merge(train, {
        result_status: TrainResultStatus.STARTED,
    });

    await repository.save(train);

    return train;
}
