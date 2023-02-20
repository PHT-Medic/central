/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainQueuePayload } from '@personalhealthtrain/central-common';
import { TrainQueueCommand } from '@personalhealthtrain/central-common';
import { cleanupTrain, setupTrain } from './handlers';

export async function executeTrainCommand(
    command: string,
    payload: TrainQueuePayload<any>,
) {
    switch (command) {
        case TrainQueueCommand.CLEANUP: {
            await cleanupTrain(payload);
            break;
        }
        case TrainQueueCommand.SETUP: {
            await setupTrain(payload);
            break;
        }
    }
}
