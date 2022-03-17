/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import tar from 'tar-stream';
import { useDocker } from './instance';
import { DockerContainerFile, DockerContainerFileType } from './type';

function extractTarStream(stream: NodeJS.ReadableStream) : Promise<DockerContainerFile[]> {
    return new Promise((resolve : (files: DockerContainerFile[]) => void, reject) => {
        const extract = tar.extract();
        const files : DockerContainerFile[] = [];

        extract.on('entry', (header, stream, callback) => {
            const buff = [];
            stream.on('data', (data) => {
                buff.push(data);
            });

            stream.on('end', () => {
                files.push({
                    name: header.name,
                    type: header.type as DockerContainerFileType,
                    content: Buffer.concat(buff).toString('utf-8'),
                    size: header.size,
                });

                callback();
            });

            stream.on('error', () => {
                reject();
            });
        });

        extract.on('finish', () => {
            resolve(files);
        });

        extract.on('error', () => {
            reject();
        });

        stream.pipe(extract);
    });
}

export async function readDockerContainerPaths(
    name: string,
    directoryPaths: string[],
) : Promise<DockerContainerFile[]> {
    const container = await useDocker().createContainer({
        Image: name,
    });

    const files : DockerContainerFile[] = [];

    for (let i = 0; i < directoryPaths.length; i++) {
        const archiveStream: NodeJS.ReadableStream = await container.getArchive({
            path: directoryPaths[i],
        });

        const archiveFiles = await extractTarStream(archiveStream);
        files.push(...archiveFiles);
    }

    return files;
}
