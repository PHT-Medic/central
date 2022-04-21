/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainFileSocketServerToClientEventName {
    CREATED = 'trainFileCreated',
    UPDATED = 'trainFileUpdated',
    DELETED = 'trainFileDeleted',
}

export enum TrainFileSocketClientToServerEventName {
    SUBSCRIBE = 'trainFileSubscribe',
    UNSUBSCRIBE = 'trainFileUnsubscribe',
}
