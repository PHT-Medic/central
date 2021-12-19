/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import tar from 'tar-stream';
import path from 'path';
import fs from 'fs';
import {
    Train, TrainFile, TrainStation, isPermittedForResourceRealm,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { getWritableDirPath } from '../../../config/paths';

export async function getTrainFileStreamRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const repository = getRepository(Train);

    const train = await repository.findOne(id);

    if (typeof train === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        const proposalStations = await getRepository(TrainStation).find({
            where: {
                train_id: train.id,
            },
            relations: ['station'],
        });

        let isPermitted = false;

        for (let i = 0; i < proposalStations.length; i++) {
            if (isPermittedForResourceRealm(req.realmId, proposalStations[i].station.realm_id)) {
                isPermitted = true;
                break;
            }
        }

        if (!isPermitted) {
            throw new ForbiddenError('You are not allowed to inspect the train files.');
        }
    }

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const pack = tar.pack();
    pack.pipe(res);

    pack.on('close', () => {
        res.end();
    });

    const trainDirectoryPath = path.resolve(`${getWritableDirPath()}/train-files`);

    const files = await getRepository(TrainFile).find({
        train_id: train.id,
    });

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const buffer: Buffer = await fs.promises.readFile(`${trainDirectoryPath}/${files[i].hash}.file`);

            await new Promise((resolve: (data?: any) => void, reject) => {
                pack.entry({ name: `${files[i].directory}/${files[i].name}`, size: files[i].size }, buffer, (err) => {
                    if (err) reject();

                    resolve();
                });
            });
        }

        pack.finalize();
    } else {
        pack.finalize();
    }
}
