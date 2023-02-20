/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainQueueCommand } from './constants';
import type { Train } from './entity';

export type TrainQueuePayload<T extends `${TrainQueueCommand}`> =
    T extends `${TrainQueueCommand.CLEANUP}` | `${TrainQueueCommand.SETUP}` ?
        { id: Train['id'] } :
        never;
