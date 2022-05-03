/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'path';
import { buildDataSourceOptions as buildOptions } from 'typeorm-extension';
import {
    setEntitiesForConnectionOptions,
} from '@authelion/api-core';
import { DataSourceOptions } from 'typeorm';
import { MasterImageEntity } from '../domains/core/master-image/entity';
import { MasterImageGroupEntity } from '../domains/core/master-image-group/entity';
import { ProposalEntity } from '../domains/core/proposal/entity';
import { TrainEntity } from '../domains/core/train/entity';
import { StationEntity } from '../domains/core/station/entity';
import { ProposalStationEntity } from '../domains/core/proposal-station/entity';
import { TrainFileEntity } from '../domains/core/train-file/entity';
import { TrainStationEntity } from '../domains/core/train-station/entity';
import { UserSecretEntity } from '../domains/core/user-secret/entity';
import { RegistryEntity } from '../domains/core/registry/entity';
import { RegistryProjectEntity } from '../domains/core/registry-project/entity';

export function extendDataSourceOptions(
    options: DataSourceOptions,
) {
    options = setEntitiesForConnectionOptions(options);

    options = {
        ...options,
        entities: [
            ...(options.entities ? options.entities : []) as string[],
            MasterImageEntity,
            MasterImageGroupEntity,
            ProposalEntity,
            ProposalStationEntity,
            RegistryEntity,
            RegistryProjectEntity,
            StationEntity,
            TrainEntity,
            TrainFileEntity,
            TrainStationEntity,
            UserSecretEntity,
        ],
    };

    options = {
        ...options,
        migrations: [
            path.join(__dirname, 'migrations', '*{.ts,.js}'),
        ],
    };

    options = {
        ...options,
        subscribers: [
            ...(options.subscribers ? options.subscribers : []) as string[],
            path.join(__dirname, 'subscribers', '*{.ts,.js}'),
        ],
    };

    return options;
}

export async function buildDataSourceOptions() {
    let options;

    try {
        options = await buildOptions();
        options.logging = ['error'];
    } catch (e) {
        options = {
            name: 'default',
            type: 'better-sqlite3',
            database: path.join(process.cwd(), 'writable', process.env.NODE_ENV === 'test' ? 'test.sql' : 'db.sql'),
            subscribers: [],
            migrations: [],
            logging: ['error'],
        };
    }

    return extendDataSourceOptions(options);
}
