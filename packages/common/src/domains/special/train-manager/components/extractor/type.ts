/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainManagerExtractorCommand } from './constants';
import { Train } from '../../../../core';

export type TrainManagerExtractorFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type TrainManagerExtractingFile = {
    name: string,
    path?: string,
    size: number,
    content: string,
    type: TrainManagerExtractorFileType
};

export type TrainManagerExtractorExtractQueuePayload = {
    id: Train['id'],

    filePaths?: string[],
    files?: TrainManagerExtractingFile[]
};

export type TrainManagerExtractorCheckQueuePayload = {
    id: Train['id']
};

export type TrainManagerExtractorPayload<C extends `${TrainManagerExtractorCommand}`> =
    C extends `${TrainManagerExtractorCommand.EXTRACT}` ?
        TrainManagerExtractorExtractQueuePayload :
        C extends `${TrainManagerExtractorCommand.CHECK}` ?
            TrainManagerExtractorCheckQueuePayload :
            never;
