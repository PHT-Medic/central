/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum DomainType {
    MASTER_IMAGE = 'masterImage',
    MASTER_IMAGE_GROUP = 'masterImageGroup',
    PROPOSAL = 'proposal',
    PROPOSAL_STATION = 'proposalStation',
    REGISTRY = 'registry',
    REGISTRY_PROJECT = 'registryProject',
    STATION = 'station',
    TRAIN = 'train',
    TRAIN_FILE = 'trainFile',
    TRAIN_LOG = 'trainLog',
    TRAIN_STATION = 'trainStation',
    USER_SECRET = 'userSecret',
}

export enum DomainSubType {
    PROPOSAL_STATION_IN = 'proposalStationIn',
    PROPOSAL_STATION_OUT = 'proposalStationOut',
    TRAIN_STATION_IN = 'trainStationIn',
    TRAIN_STATION_OUT = 'TrainStationOut',
}

export enum DomainEventName {
    CREATED = 'created',
    DELETED = 'deleted',
    UPDATED = 'updated',
}

export enum DomainEventSubscriptionName {
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
}
