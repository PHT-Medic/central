/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Image } from 'dockerode';
import { useDocker } from './instance';
import { DockerAuthConfig } from './type';

export async function pushDockerImage(image: Image | string, authConfig: DockerAuthConfig) {
    const imageLatest = typeof image === 'string' ?
        await useDocker().getImage(image) :
        image;

    const stream = await imageLatest.push({
        authconfig: authConfig,
    });

    await new Promise((resolve, reject) => {
        useDocker().modem.followProgress(
            stream,
            (err: Error, res: any[]) => {
                if (err) {
                    return reject(err);
                }

                return resolve(res);
            },
        );
    });

    await imageLatest.remove({
        force: true,
    });
}
