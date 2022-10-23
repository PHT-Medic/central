/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { publishMessage } from 'amqp-extension';
import {
    TrainBuildStatus,
    TrainManagerComponent,
    TrainManagerRouterCommand,
} from '@personalhealthtrain/central-common';
import { buildTrainManagerQueueMessage } from '../../../special/train-manager';
import { TrainEntity } from '../entity';

export async function detectTrainRunStatus(train: TrainEntity) : Promise<TrainEntity> {
    if (
        train.build_status !== TrainBuildStatus.FINISHED
    ) {
        throw new BadRequestError('The train has not been build yet...');
    } else {
        await publishMessage(buildTrainManagerQueueMessage(
            TrainManagerComponent.ROUTER,
            TrainManagerRouterCommand.CHECK,
            {
                id: train.id,
            },
        ));
    }

    return train;
}
