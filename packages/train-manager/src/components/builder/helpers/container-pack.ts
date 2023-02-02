/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createKeyPair } from '@authup/server-common';
import { HTTPClient, TrainContainerFileName, TrainContainerPath } from '@personalhealthtrain/central-common';
import crypto from 'crypto';
import { Container } from 'dockerode';
import { useClient } from 'hapic';
import tar from 'tar-stream';
import { createSignature, encryptSymmetric, streamToBuffer } from '../../../core';
import { useLogger } from '../../../modules/log';
import { BuilderError } from '../error';
import { createPackFromFileContent } from './file-gzip';
import { buildTrainConfig } from './train-config';
import { ContainerPackContext } from './type';

export async function packContainerWithTrain(container: Container, context: ContainerPackContext) {
    const keyPair = await createKeyPair({
        save: false,
    });

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

    const stationPublicKeyString = Buffer.from(trainConfig.route[stationFirstIndex].rsa_public_key, 'hex').toString('utf-8');
    const stationPublicKey = crypto.createPublicKey(stationPublicKeyString);

    const symmetricKeyEncrypted = crypto.publicEncrypt(stationPublicKey, symmetricKey);

    trainConfig.route[stationFirstIndex].encrypted_key = symmetricKeyEncrypted.toString('hex');

    // -----------------------------------------------------------------------------------

    useLogger().debug(`Writing ${TrainContainerFileName.CONFIG} to container`, {
        component: 'building',
    });

    await container.putArchive(
        createPackFromFileContent(JSON.stringify(trainConfig), TrainContainerFileName.CONFIG),
        {
            path: '/opt',
        },
    );

    // -----------------------------------------------------------------------------------

    if (context.train.query) {
        useLogger().debug(`Writing ${TrainContainerFileName.QUERY} to container`, {
            component: 'building',
        });

        let { query } = context.train;
        if (typeof query !== 'string') {
            query = JSON.stringify(query);
        }

        const queryEncrypted = encryptSymmetric(symmetricKey, symmetricKeyIv, query);

        await container.putArchive(
            createPackFromFileContent(queryEncrypted, TrainContainerFileName.QUERY),
            {
                path: '/opt',
            },
        );
    }

    // -----------------------------------------------------------------------------------

    useLogger().debug('Writing files to container', {
        component: 'building',
    });

    const client = useClient<HTTPClient>();
    const stream : NodeJS.ReadableStream = await client.train.downloadFiles(context.train.id);

    const extract = tar.extract();
    const pack = tar.pack();

    extract.on('entry', async (header, stream, callback) => {
        const buff = await streamToBuffer(stream);
        const buffEncrypted = encryptSymmetric(symmetricKey, symmetricKeyIv, buff);

        pack.entry(header, buffEncrypted, callback);
    });

    extract.on('finish', () => {
        pack.finalize();
    });

    stream.pipe(extract);

    await container.putArchive(pack, {
        path: TrainContainerPath.MAIN,
    });
}
