/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import tar from 'tar-stream';
import fs from 'fs';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { getTrainFilesDirectoryPath } from '../../../../../config/train-file/path';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { TrainFileEntity } from '../../../../../domains/core/train-file/entity';

export async function streamTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const train = await repository.findOneBy({ id });

    if (!train) {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        const proposalStations = await dataSource.getRepository(TrainStationEntity).find({
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

    const trainDirectoryPath = getTrainFilesDirectoryPath(train.id);

    const files = await dataSource.getRepository(TrainFileEntity).findBy({
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
