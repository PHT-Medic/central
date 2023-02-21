/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryQueueCommand {
    SETUP = 'SETUP',
    DELETE = 'DELETE',

    PROJECT_LINK = 'PROJECT_LINK',
    PROJECT_RELINK = 'PROJECT_RELINK',
    PROJECT_UNLINK = 'PROJECT_UNLINK',

    EVENT_HANDLE = 'EVENT_HANDLE',
}

export enum RegistryQueueEvent {
    PUSH_ARTIFACT = 'PUSH_ARTIFACT',
    PULL_ARTIFACT = 'PULL_ARTIFACT',
    DELETE_ARTIFACT = 'DELETE_ARTIFACT',

    SCANNING_COMPLETED = 'SCANNING_COMPLETED',
    SCANNING_FAILED = 'SCANNING_FAILED',

    QUOTA_EXCEED = 'QUOTA_EXCEED',
    QUOTA_WARNING = 'QUOTA_WARNING',
}
