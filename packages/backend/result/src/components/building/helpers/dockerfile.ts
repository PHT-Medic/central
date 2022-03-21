/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainContainerPath,
    parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import path from 'path';
import { URL } from 'url';
import env from '../../../env';

export async function buildDockerFile(entity: Train) : Promise<string> {
    const harborConfig = parseHarborConnectionString(env.harborConnectionString);
    const harborUrL = new URL(harborConfig.host);

    let argumentsString = '';

    if (entity.master_image.command_arguments) {
        let parts = Array.isArray(entity.master_image.command_arguments) ?
            entity.master_image.command_arguments :
            [entity.master_image.command_arguments];

        parts = parts.map((part) => `"${part}"`);
        argumentsString = `${parts.join(', ')} `;
    }

    const entrypointPath = path.posix.join(
        entity.entrypoint_file.directory,
        entity.entrypoint_file.name,
    );

    return `
    FROM ${harborUrL.hostname}/master/${entity.master_image.virtual_path}
    RUN mkdir ${TrainContainerPath.MAIN} &&\
        mkdir ${TrainContainerPath.RESULTS} &&\
        chmod -R +x ${TrainContainerPath.MAIN}

    CMD ["${entity.master_image.command}", ${argumentsString}"${path.posix.join(TrainContainerPath.MAIN, entrypointPath)}"]
    `;
}
