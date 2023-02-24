/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Train } from '@personalhealthtrain/central-common';
import type { ComponentExecutionContext } from '@personalhealthtrain/central-server-common';
import type { ExtractorCommand } from './constants';

export type ExtractorFileType = 'file' | 'link' | 'symlink' | 'directory' |
'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

export type ExtractingFile = {
    name: string,
    path?: string,
    size: number,
    content: string,
    type: ExtractorFileType
};

export type ExtractorExtractPayload = {
    id: Train['id'],

    filePaths?: string[],
    files?: ExtractingFile[]
};

export type ExtractorCheckPayload = {
    id: Train['id']
};

export type ExtractorPayload<C extends `${ExtractorCommand}`> =
    C extends `${ExtractorCommand.EXTRACT}` ?
        ExtractorExtractPayload :
        C extends `${ExtractorCommand.CHECK}` ?
            ExtractorCheckPayload :
            never;

export type ExtractorExecutionContext = ComponentExecutionContext<ExtractorCommand.CHECK, ExtractorCheckPayload> |
ComponentExecutionContext<ExtractorCommand.EXTRACT, ExtractorExtractPayload>;
