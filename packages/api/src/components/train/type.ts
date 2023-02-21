/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';
import type { TrainCommand } from './constants';

export type TrainPayload<T extends `${TrainCommand}`> =
    T extends `${TrainCommand.CLEANUP}` | `${TrainCommand.SETUP}` ?
        { id: Train['id'] } :
        never;

export type TrainComponentExecuteContext = {
    data: TrainPayload<any>,
    command: string
};
