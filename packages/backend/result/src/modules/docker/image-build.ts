/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import tar from 'tar-stream';
import { createGzip } from 'zlib';
import { useDocker } from './instance';
import { DockerAuthConfig } from './type';

export async function buildDockerImage(
    context: {
        content: string,
        imageName: string,
        authConfig: DockerAuthConfig
    },
) {
    const pack = tar.pack();
    const entry = pack.entry({
        name: 'Dockerfile',
        type: 'file',
        size: context.content.length,
    }, (err) => {
        if (err) {
            pack.destroy(err);
        }

        pack.finalize();
    });

    entry.write(context.content);
    entry.end();

    const stream = await useDocker().buildImage(pack.pipe(createGzip()), {
        t: context.imageName,
        authconfig: context.authConfig,
    });

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: Error, output: any) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(output);
        }, (e: any) => e);
    }));
}
