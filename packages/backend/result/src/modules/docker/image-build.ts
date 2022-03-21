/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import tar from 'tar-stream';
import { createGzip } from 'zlib';
import { useDocker } from './instance';

export async function buildDockerImage(
    content: string,
    imageName : string,
) {
    const pack = tar.pack();
    const entry = pack.entry({
        name: 'Dockerfile',
        type: 'file',
        size: content.length,
    }, (err) => {
        if (err) {
            pack.destroy(err);
        }

        pack.finalize();
    });

    entry.write(content);
    entry.end();

    const stream = await useDocker().buildImage(pack.pipe(createGzip()), {
        t: imageName,
    });

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: Error, output: any) => {
            if (error) {
                reject(error);
            }

            resolve(output);
        }, (e: any) => e);
    }));
}
