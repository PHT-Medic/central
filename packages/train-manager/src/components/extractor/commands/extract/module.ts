/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Writable } from 'node:stream';
import {
    generateTrainMinioBucketName,
} from '../../../../config';
import {
    buildRemoteDockerImageURL,
    removeDockerImage,
    saveDockerContainerPathsTo,
    useMinio,
} from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { ExtractorCommand } from '../../constants';
import { ExtractorError } from '../../error';
import type { ExtractorExtractPayload } from '../../type';
import { useExtractorLogger } from '../../utils';

export async function executeExtractorExtractCommand(
    input: ExtractorExtractPayload,
) : Promise<ComponentPayloadExtended<ExtractorExtractPayload>> {
    useExtractorLogger().debug('Executing command', {
        command: ExtractorCommand.EXTRACT,
    });

    const data = await extendPayload(input);

    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    if (!data.registryProject) {
        throw ExtractorError.registryProjectNotFound({
            message: 'There was no registry-project found during the download process.',
        });
    }

    if (!data.filePaths || data.filePaths.length === 0) {
        useExtractorLogger().warn('No files to save.', {
            command: ExtractorCommand.EXTRACT,
        });
        return data;
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

    useExtractorLogger().debug('Load and stream container paths.', {
        command: ExtractorCommand.EXTRACT,
    });

    await saveDockerContainerPathsTo(
        repositoryPath,
        data.filePaths,
        stream,
    );

    const buff = Buffer.concat(buffArr);
    const size = Buffer.byteLength(buff);

    const minio = useMinio();
    const bucketName = generateTrainMinioBucketName(data.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }

    try {
        await minio.removeObject(bucketName, 'result');
    } catch (e) {
        // do nothing :/
    }

    useExtractorLogger().debug('Saving container paths to minio.', {
        command: ExtractorCommand.EXTRACT,
    });

    await minio.putObject(
        bucketName,
        'result',
        buff,
        size,
    );

    try {
        // we are done here with the docker image :)
        await removeDockerImage(repositoryPath);
    } catch (e) {
        // we tried :P
    }

    return data;
}
