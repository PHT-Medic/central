/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryProjectType {
    DEFAULT = 'default',
    AGGREGATOR = 'aggregator',
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    MASTER_IMAGES = 'masterImages',
    STATION = 'station',
}

export enum RegistryProjectSocketServerToClientEventName {
    CREATED = 'registryProjectCreated',
    UPDATED = 'registryProjectUpdated',
    DELETED = 'registryProjectDeleted',
}

export enum RegistryProjectSocketClientToServerEventName {
    SUBSCRIBE = 'registryProjectSubscribe',
    UNSUBSCRIBE = 'registryProjectUnsubscribe',
}
