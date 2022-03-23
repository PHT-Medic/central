/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerExtractingMode, TrainManagerQueueCommand } from './constants';
import { Registry, RegistryProject, Train } from '../../core';

// ----------------------------------------------------------

export type TrainManagerBaseQueuePayload = {
    id: Train['id'],
    entity?: Train,
    registry?: Registry,
    registryId?: Registry['id'],
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

export type TrainManagerQueuePayload<T extends `${TrainManagerQueueCommand}`> =
    T extends `${TrainManagerQueueCommand.EXTRACT}` | `${TrainManagerQueueCommand.EXTRACT_STATUS}` ?
        TrainManagerExtractingQueuePayload :
        T extends `${TrainManagerQueueCommand.BUILD}` | `${TrainManagerQueueCommand.BUILD_STATUS}` ?
            TrainManagerBuildPayload :
            T extends `${TrainManagerQueueCommand.ROUTE}` ?
                TrainManagerRoutingPayload :
                T extends `${TrainManagerQueueCommand.ROUTE_START}` ?
                    TrainManagerRoutingStartPayload :
                    never;
