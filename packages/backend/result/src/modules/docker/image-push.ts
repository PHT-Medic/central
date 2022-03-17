/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseHarborConnectionString } from '@personalhealthtrain/central-common';
import { URL } from 'url';
import env from '../../env';
import { useDocker } from './instance';
import { DockerPushImage, DockerPushImageOptions } from './type';

export async function pushDockerImages(images: DockerPushImage[], options?: DockerPushImageOptions) {
    options = options || {};
    options.remove = options.remove ?? true;

    const harborConfig = parseHarborConnectionString(env.harborConnectionString);
    const harborUrL = new URL(harborConfig.host);

    for (let i = 0; i < images.length; i++) {
        const imageLatest = await useDocker()
            .getImage(`${images[i].name}:${images[i].tag || 'latest'}`);

        const stream = await imageLatest.push({
            authconfig: {
                username: harborConfig.user,
                password: harborConfig.password,
                serveraddress: harborUrL.hostname,
            },
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

        if (options.remove) {
            await imageLatest.remove();
        }
    }
}
