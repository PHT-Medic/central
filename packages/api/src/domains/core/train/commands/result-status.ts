/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ExtractorCommand, buildExtractorQueuePayload } from '@personalhealthtrain/train-manager';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { TrainEntity } from '../entity';

export async function triggerTrainResultStatus(
    train: string | TrainEntity,
) : Promise<TrainEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    train = await resolveTrain(train, repository);

    // send queue message
    await publish(buildExtractorQueuePayload({
        command: ExtractorCommand.CHECK,
        data: {
            id: train.id,
        },
    }));

    return train;
}
