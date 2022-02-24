/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryQueueCommand {
    SAVE = 'REGISTRY_SAVE',
    SETUP = 'REGISTRY_SETUP',
    DELETE = 'REGISTRY_DELETE',
}

export enum RegistryQueueEvent {
    PUSH_ARTIFACT = 'REGISTRY_PUSH_ARTIFACT',
    PULL_ARTIFACT = 'REGISTRY_PULL_ARTIFACT',
    DELETE_ARTIFACT = 'REGISTRY_DELETE_ARTIFACT',

    SCANNING_COMPLETED = 'REGISTRY_SCANNING_COMPLETED',
    SCANNING_FAILED = 'REGISTRY_SCANNING_FAILED',

    QUOTA_EXCEED = 'REGISTRY_QUOTA_EXCEED',
    QUOTA_WARNING = 'REGISTRY_QUOTA_WARNING',
}

export enum RegistryQueueEntityType {
    STATION = 'station',
}
