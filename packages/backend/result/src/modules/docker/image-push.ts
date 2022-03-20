/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDocker } from './instance';
import { DockerAuthConfig } from './type';

export async function pushDockerImages(image: string, authConfig: DockerAuthConfig) {
    const imageLatest = await useDocker()
        .getImage(image);

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
