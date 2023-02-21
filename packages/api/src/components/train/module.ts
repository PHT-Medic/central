/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainCommand } from './constants';
import { cleanupTrain, setupTrain } from './handlers';
import type { TrainComponentExecuteContext } from './type';

export async function executeTrainCommand(context: TrainComponentExecuteContext) {
    switch (context.command) {
        case TrainCommand.CLEANUP: {
            await cleanupTrain(context.data);
            break;
        }
        case TrainCommand.SETUP: {
            await setupTrain(context.data);
            break;
        }
    }
}
