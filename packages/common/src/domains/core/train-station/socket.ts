/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainStation } from './entity';

export function buildSocketTrainStationRoomName(id?: typeof TrainStation.prototype.id) {
    return `train-stations${id ? `#${id}` : ''}`;
}

export function buildSocketTrainStationOutRoomName(id?: typeof TrainStation.prototype.id) {
    return `train-stations-out${id ? `#${id}` : ''}`;
}

export function buildSocketTrainStationInRoomName(id?: typeof TrainStation.prototype.id) {
    return `train-stations-in${id ? `#${id}` : ''}`;
}
