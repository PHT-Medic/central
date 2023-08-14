/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Writable } from 'node:stream';
import fs from 'node:fs';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import { useDocker } from './instance';

function extractTarStreamToPacker(stream: NodeJS.ReadableStream, packer: Pack): Promise<void> {
    return new Promise((resolve, reject) => {
        const extract = tar.extract();

        extract.on('entry', (header, stream, callback) => {
            stream.pipe(packer.entry(header, callback));
        });

        extract.on('finish', () => {
            resolve();
        });

        extract.on('error', () => {
            reject();
        });

        stream.pipe(extract);
    });
}

export async function saveDockerContainerPathsTo(
    containerName: string,
    containerDirectoryPaths: string[],
    destination: string | Writable,
) {
    let stream : Writable;

    if (typeof destination === 'string') {
        stream = fs.createWriteStream(destination, {
            mode: 0o775,
        });
    } else {
        stream = destination;
    }

    const pack = tar.pack();

    pack.pipe(stream);

    const container = await useDocker().createContainer({
        Image: containerName,
    });

    const promises : Promise<void>[] = [];

    for (let i = 0; i < containerDirectoryPaths.length; i++) {
        const promise = new Promise<void>((resolve, reject) => {
            container.getArchive({
                path: containerDirectoryPaths[i],
            })
                .then((archive) => extractTarStreamToPacker(archive, pack))
                .then(() => resolve())
                .catch((e) => reject(e));
        });

        promises.push(promise);
    }

    await Promise.all(promises);

    await container.remove();

    pack.finalize();
}
