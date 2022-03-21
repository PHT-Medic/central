/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    Train,
    TrainContainerPath, parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import path from 'path';
import { URL } from 'url';
import { useClient } from '@trapi/client';
import env from '../../../env';

export async function buildDockerFile(entity: Train) : Promise<string> {
    const harborConfig = parseHarborConnectionString(env.harborConnectionString);
    const harborUrL = new URL(harborConfig.host);

    const entrypointPath = path.posix.join(
        entity.entrypoint_file.directory,
        entity.entrypoint_file.name,
    );

    let entrypointCommand = entity.master_image.command;
    let entrypointCommandArguments = entity.master_image.command_arguments;

    const client = useClient<HTTPClient>();

    const { data: masterImageGroups } = await client.masterImageGroup.getMany({
        filter: {
            virtual_path: entity.master_image.group_virtual_path,
        },
    });

    if (masterImageGroups.length > 0) {
        const masterImageGroup = masterImageGroups.shift();
        if (masterImageGroup) {
            entrypointCommand = entrypointCommand || masterImageGroup.command;
            entrypointCommandArguments = entrypointCommandArguments || masterImageGroup.command_arguments;
        }
    }

    let argumentsString = '';

    if (entrypointCommandArguments) {
        let parts = Array.isArray(entrypointCommandArguments) ?
            entrypointCommandArguments :
            [entrypointCommandArguments];

        parts = parts.map((part) => `"${part}"`);
        argumentsString = `${parts.join(', ')} `;
    }

    return `
    FROM ${harborUrL.hostname}/master/${entity.master_image.virtual_path}
    RUN mkdir ${TrainContainerPath.MAIN} &&\
        mkdir ${TrainContainerPath.RESULTS} &&\
        chmod -R +x ${TrainContainerPath.MAIN}

    CMD ["${entrypointCommand}", ${argumentsString}"${path.posix.join(TrainContainerPath.MAIN, entrypointPath)}"]
    `;
}
