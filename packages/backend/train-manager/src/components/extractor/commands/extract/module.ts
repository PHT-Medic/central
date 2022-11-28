/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import {
    TrainManagerExtractorExtractQueuePayload,
    TrainManagerQueuePayloadExtended,
} from '@personalhealthtrain/central-common';
import { Writable } from 'stream';
import {
    buildRemoteDockerImageURL,
    generateTrainResultsMinioBucketName,
} from '../../../../config';
import { useMinio } from '../../../../core/minio';
import { removeDockerImage, saveDockerContainerPathsTo } from '../../../../modules/docker';
import { ExtractorError } from '../../error';

export async function processExtractCommand(message: Message) {
    const data = message.data as TrainManagerQueuePayloadExtended<TrainManagerExtractorExtractQueuePayload>;

    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    if (!data.registryProject) {
        throw ExtractorError.registryProjectNotFound({
            message: 'There was no registry-project during the download process.',
        });
    }

    if (!data.filePaths || data.filePaths.length === 0) {
        return {
            ...message,
            data,
        };
    }

    // -----------------------------------------------------------------------------------

    const repositoryPath: string = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: data.registryProject.external_name,
        repositoryName: data.id,
    });

    const buffArr : Buffer[] = [];

    const stream = new Writable({
        write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
            if (Buffer.isBuffer(chunk)) {
                buffArr.push(chunk);
            } else {
                buffArr.push(Buffer.from(chunk, encoding));
            }

            callback();
        },
    });

    await saveDockerContainerPathsTo(
        repositoryPath,
        data.filePaths,
        stream,
    );

    const buff = Buffer.concat(buffArr);
    const size = Buffer.byteLength(buff);

    const minio = useMinio();
    const bucketName = generateTrainResultsMinioBucketName(data.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }

    try {
        await minio.removeObject(bucketName, data.id);
    } catch (e) {
        // do nothing :/
    }

    await minio.putObject(
        bucketName,
        data.id, // todo: unique result identifier :)
        buff,
        size,
    );

    try {
        // we are done here with the docker image :)
        await removeDockerImage(repositoryPath);
    } catch (e) {
        // we tried :P
    }

    return {
        ...message,
        data,
    };
}
