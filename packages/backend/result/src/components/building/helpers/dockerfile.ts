/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainBuilderStartPayload,
    TrainContainerPath,
    parseHarborConnectionString,
} from '@personalhealthtrain/central-common';
import path from 'path';
import { URL } from 'url';
import env from '../../../env';
import { useLogger } from '../../../modules/log';

export async function buildDockerFile(data: TrainBuilderStartPayload) : Promise<string> {
    const harborConfig = parseHarborConnectionString(env.harborConnectionString);
    const harborUrL = new URL(harborConfig.host);

    let argumentsString = '';

    if (data.entrypoint_command_arguments) {
        let parts = Array.isArray(data.entrypoint_command_arguments) ?
            data.entrypoint_command_arguments :
            [data.entrypoint_command_arguments];

        parts = parts.map((part) => `"${part}"`);
        argumentsString = `${parts.join(', ')} `;
    }

    useLogger().debug('Building Dockerfile', {
        component: 'building',
    });

    return `
    FROM ${harborUrL.hostname}/master/${data.master_image}
    RUN mkdir ${TrainContainerPath.MAIN} &&\
        mkdir ${TrainContainerPath.RESULTS} &&\
        chmod -R +x ${TrainContainerPath.MAIN}

    CMD ["${data.entrypoint_command}", ${argumentsString}"${path.posix.join(TrainContainerPath.MAIN, data.entrypoint_path)}"]
    `;
}
