/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerBaseErrorCode,
    TrainManagerBuildingErrorCode,
    TrainManagerBuildingQueueEvent, TrainManagerBuildingStep, TrainManagerExtractingErrorCode,
    TrainManagerExtractingMode, TrainManagerExtractingQueueEvent, TrainManagerExtractingStep,
    TrainManagerQueueCommand, TrainManagerRoutingErrorCode,
    TrainManagerRoutingQueueEvent, TrainManagerRoutingStep,
} from './constants';
import { Registry, RegistryProject, Train } from '../../core';

// ----------------------------------------------------------

export type TrainManagerBaseQueuePayload = {
    id: Train['id'],
};

export type TrainManagerQueuePayloadExtended<T extends Record<string, any>> = T & {
    entity: Train,

    registry: Registry,
    registryId: Registry['id'],

    registryProject?: RegistryProject,
    registryProjectId?: RegistryProject['id']
};

// ----------------------------------------------------------

export type TrainManagerExtractingFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type TrainManagerExtractingFile = {
    name: string,
    path?: string,
    size: number,
    content: string,
    type: TrainManagerExtractingFileType
};

export type TrainManagerExtractingQueuePayload = TrainManagerBaseQueuePayload & {
    filePaths?: string[],
    files?: TrainManagerExtractingFile[],

    mode: `${TrainManagerExtractingMode}`,
};

// ----------------------------------------------------------

export type TrainManagerRoutingPayload = {
    repositoryName: string,
    projectName: string,
    operator: string,
    artifactTag: string
};

export type TrainManagerRoutingStartPayload = TrainManagerBaseQueuePayload & {
    id: Train['id']
};

// ----------------------------------------------------------

export type TrainManagerBuildPayload = TrainManagerBaseQueuePayload;

// ----------------------------------------------------------

export type TrainManagerQueueCommandPayload<T extends `${TrainManagerQueueCommand}`> =
    T extends `${TrainManagerQueueCommand.EXTRACT}` | `${TrainManagerQueueCommand.EXTRACT_STATUS}` ?
        TrainManagerExtractingQueuePayload :
        T extends `${TrainManagerQueueCommand.BUILD}` | `${TrainManagerQueueCommand.BUILD_STATUS}` ?
            TrainManagerBuildPayload :
            T extends `${TrainManagerQueueCommand.ROUTE}` ?
                TrainManagerRoutingPayload :
                T extends `${TrainManagerQueueCommand.ROUTE_START}` ?
                    TrainManagerRoutingStartPayload :
                    never;

export type TrainManagerQueueEventPayload<
    T extends `${TrainManagerRoutingQueueEvent}` | `${TrainManagerBuildingQueueEvent}` | `${TrainManagerExtractingQueueEvent}`,
    > =
    T extends `${TrainManagerRoutingQueueEvent}` ?
        TrainManagerRoutingPayload :
        T extends `${TrainManagerBuildingQueueEvent}` ?
            TrainManagerBuildPayload :
            T extends `${TrainManagerExtractingQueueEvent}` ?
                TrainManagerExtractingQueuePayload :
                never;

// ----------------------------------------------------------

export type TrainManagerQueueErrorEventPayload<
    T extends `${TrainManagerRoutingQueueEvent}` | `${TrainManagerBuildingQueueEvent}` | `${TrainManagerExtractingQueueEvent}`,
    > = T extends `${TrainManagerRoutingQueueEvent.FAILED}` |
    `${TrainManagerBuildingQueueEvent.FAILED}` |
    `${TrainManagerExtractingQueueEvent.FAILED}` ? {
            error?: {
                message?: string,
                step: T extends `${TrainManagerRoutingQueueEvent.FAILED}` ?
                    TrainManagerRoutingStep :
                    T extends `${TrainManagerBuildingQueueEvent.FAILED}` ?
                        TrainManagerBuildingStep :
                        T extends `${TrainManagerExtractingQueueEvent.FAILED}` ?
                            TrainManagerExtractingStep :
                            never,
                code: T extends `${TrainManagerRoutingQueueEvent.FAILED}` ?
                    TrainManagerRoutingErrorCode | TrainManagerBaseErrorCode :
                    T extends `${TrainManagerBuildingQueueEvent.FAILED}` ?
                        TrainManagerBuildingErrorCode | TrainManagerBaseErrorCode :
                        T extends `${TrainManagerExtractingQueueEvent.FAILED}` ?
                            TrainManagerExtractingErrorCode | TrainManagerBaseErrorCode :
                            never;
            };
        // eslint-disable-next-line @typescript-eslint/ban-types
        } : { };

export type TrainManagerQueueEventPayloadExtended<
    T extends `${TrainManagerRoutingQueueEvent}` | `${TrainManagerBuildingQueueEvent}` | `${TrainManagerExtractingQueueEvent}`,
    > = TrainManagerQueueEventPayload<T> & TrainManagerQueueErrorEventPayload<T>;
