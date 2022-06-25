/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerComponent {
    BUILDER = 'builder',
    EXTRACTOR = 'extractor',
    ROUTER = 'router',
}

export enum TrainManagerErrorCode {
    NOT_FOUND = 'notFound',
    REGISTRY_NOT_FOUND = 'registryNotFound',
    REGISTRY_PROJECT_NOT_FOUND = 'registryProjectNotFound',
    UNKNOWN = 'unknown',
}
