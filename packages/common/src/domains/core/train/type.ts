/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainQueueCommand } from './constants';
import { Train } from './entity';

export type TrainCleanupQueuePayload = {
    id: Train['id']
};

export type TrainQueuePayload<T extends `${TrainQueueCommand}`> =
    T extends `${TrainQueueCommand.CLEANUP}` ?
        TrainCleanupQueuePayload :
        never;
