/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@personalhealthtrain/central-common';
import { TrainContainerFileName, TrainContainerPath } from '@personalhealthtrain/central-common';
import stream from 'node:stream';
import crypto from 'node:crypto';
import type { Container } from 'dockerode';
import { useClient } from 'hapic';
import tar from 'tar-stream';
import {
    createSignature, encryptSymmetric, generateRSAKeyPair,
    streamToBuffer,
} from '../../../core';
import { BuilderCommand } from '../constants';
import { BuilderError } from '../error';
import { useBuilderLogger } from '../utils';
import { createPackFromFileContent } from './file-gzip';
import { buildTrainConfig } from './train-config';
import type { ContainerPackContext } from './type';

export async function packContainerWithTrain(container: Container, context: ContainerPackContext) {
    const keyPair = await generateRSAKeyPair();

    const symmetricKey = crypto.randomBytes(32);
    const symmetricKeyIv = crypto.randomBytes(16);

    // -----------------------------------------------------------------------------------

    const trainConfig = await buildTrainConfig({
        entity: context.train,
        masterImagePath: context.masterImagePath,
    });

    trainConfig.build = {
        rsa_public_key: Buffer.from(keyPair.publicKey, 'utf-8').toString('hex'),
        signature: createSignature({
            data: `${trainConfig.hash}${trainConfig.signature}`,
            key: keyPair.privateKey,
        }),
    };

    const stationFirstIndex = trainConfig.route.findIndex((route) => route.index === 0);
    if (stationFirstIndex === -1) {
        throw new BuilderError('First station in route could not be determined.');
    }

    if (typeof trainConfig.route[stationFirstIndex].rsa_public_key !== 'string') {
        throw new BuilderError('The public key of the first station in the route is not defined.');
    }

    const stationPublicKeyString = Buffer.from(
        trainConfig.route[stationFirstIndex].rsa_public_key,
        'hex',
    ).toString('utf-8');

    const stationPublicKey = crypto.createPublicKey(stationPublicKeyString);

    const symmetricKeyEncrypted = crypto.publicEncrypt({
        key: stationPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha512',
    }, symmetricKey);

    trainConfig.route[stationFirstIndex].encrypted_key = symmetricKeyEncrypted.toString('hex');

    // -----------------------------------------------------------------------------------

    useBuilderLogger()
        .debug(`Writing ${TrainContainerFileName.CONFIG} to container`, {
            command: BuilderCommand.BUILD,
        });

    await container.putArchive(
        createPackFromFileContent(JSON.stringify(trainConfig), TrainContainerFileName.CONFIG),
        {
            path: '/opt',
        },
    );

    // -----------------------------------------------------------------------------------

    const pack = tar.pack();

    // -----------------------------------------------------------------------------------

    if (context.train.query) {
        useBuilderLogger()
            .debug(`Writing ${TrainContainerFileName.QUERY} to container`, {
                command: BuilderCommand.BUILD,
            });

        let { query } = context.train;
        if (typeof query !== 'string') {
            query = JSON.stringify(query);
        }

        const queryEncrypted = encryptSymmetric(symmetricKey, symmetricKeyIv, query);

        pack.entry({ name: TrainContainerFileName.QUERY }, queryEncrypted);
    }

    // -----------------------------------------------------------------------------------

    useBuilderLogger()
        .debug('Writing files to container', {
            command: BuilderCommand.BUILD,
        });

    const client = useClient<APIClient>();

    return new Promise<void>((resolve, reject) => {
        client.request({
            url: client.train.getFilesDownloadPath(context.train.id),
            responseType: 'stream',
        })
            .then((response) => {
                const extract = tar.extract();

                const files : [string, Buffer][] = [];

                extract.on('entry', (header, stream, callback) => {
                    streamToBuffer(stream)
                        .then((buff) => {
                            useBuilderLogger()
                                .debug(`Extracting train file ${header.name} (${header.size} bytes).`, {
                                    command: BuilderCommand.BUILD,
                                });

                            files.push([header.name, buff]);

                            callback();
                        })
                        .catch((e) => {
                            useBuilderLogger()
                                .error(`Extracting train file ${header.name} (${header.size} bytes) failed.`, {
                                    command: BuilderCommand.BUILD,
                                });
                            callback(e);
                        });
                });

                extract.on('error', () => {
                    reject(new BuilderError('The train file stream could not be extracted'));
                });

                extract.on('finish', () => {
                    for (let i = 0; i < files.length; i++) {
                        useBuilderLogger()
                            .debug(`Encrypting/Packing train file ${files[i][0]}.`, {
                                command: BuilderCommand.BUILD,
                            });

                        pack.entry({ name: files[i][0] }, encryptSymmetric(symmetricKey, symmetricKeyIv, files[i][1]));

                        useBuilderLogger()
                            .debug(`Encrypted/Packed train file ${files[i][0]}.`, {
                                command: BuilderCommand.BUILD,
                            });
                    }

                    pack.finalize();

                    container.putArchive(pack, { path: TrainContainerPath.MAIN })
                        .then(() => resolve())
                        .catch(() => reject(new BuilderError('The train pack stream could not be forwarded to the container.')));
                });

                const readStream = stream.Readable.fromWeb(response.data as any);

                readStream.pipe(extract);
            })
            .catch((e) => reject(e));
    });
}
