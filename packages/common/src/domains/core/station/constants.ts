/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum StationSocketServerToClientEventName {
    CREATED = 'stationCreated',
    UPDATED = 'stationUpdated',
    DELETED = 'stationDeleted',
}

export enum StationSocketClientToServerEventName {
    SUBSCRIBE = 'stationSubscribe',
    UNSUBSCRIBE = 'stationUnsubscribe',
}
