/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrainLog } from './entity';

export function buildSocketTrainLogRoomName(id?: TrainLog['id']) {
    return `train-logs${id ? `#${id}` : ''}`;
}
