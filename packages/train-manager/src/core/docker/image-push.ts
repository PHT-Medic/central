/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Image } from 'dockerode';
import { useDocker } from './instance';
import { findErrorInDockerModemResponse } from './modem-response';
import type { DockerAuthConfig } from './type';

export async function pushDockerImage(image: Image | string, authConfig: DockerAuthConfig) {
    const imageLatest = typeof image === 'string' ?
        await useDocker().getImage(image) :
        image;

    const stream = await imageLatest.push({
        authconfig: authConfig,
    });

    await new Promise((resolve, reject) => {
        useDocker().modem.followProgress(
            stream as any,
            (error: Error, output: any[]) => {
                error = error || findErrorInDockerModemResponse(output);
                if (error) {
                    return reject(error);
                }

                return resolve(output);
            },
        );
    });

    await imageLatest.remove({
        force: true,
    });
}
