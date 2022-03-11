/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'path';
import { ConnectionWithAdditionalOptions, buildConnectionOptions } from 'typeorm-extension';
import {
    setEntitiesForConnectionOptions,
} from '@typescript-auth/server-core';
import { ConnectionOptions } from 'typeorm';
import { MasterImageEntity } from '../domains/core/master-image/entity';
import { MasterImageGroupEntity } from '../domains/core/master-image-group/entity';
import { ProposalEntity } from '../domains/core/proposal/entity';
import { TrainEntity } from '../domains/core/train/entity';
import { StationEntity } from '../domains/core/station/entity';
import { ProposalStationEntity } from '../domains/core/proposal-station/entity';
import { TrainFileEntity } from '../domains/core/train-file/entity';
import { TrainStationEntity } from '../domains/core/train-station/entity';
import { UserSecretEntity } from '../domains/core/user-secret/entity';

export function modifyDatabaseConnectionOptions(
    connectionOptions: ConnectionWithAdditionalOptions,
) {
    connectionOptions = setEntitiesForConnectionOptions(connectionOptions);

    connectionOptions = {
        ...connectionOptions,
        entities: [
            ...(connectionOptions.entities ? connectionOptions.entities : []),
            MasterImageEntity,
            MasterImageGroupEntity,
            ProposalEntity,
            ProposalStationEntity,
            StationEntity,
            TrainEntity,
            TrainFileEntity,
            TrainStationEntity,
            UserSecretEntity,
        ],
    };

    connectionOptions = {
        ...connectionOptions,
        migrations: [
            path.join(__dirname, 'migrations', '*{.ts,.js}'),
        ],
    };

    connectionOptions = {
        ...connectionOptions,
        subscribers: [
            ...(connectionOptions.subscribers ? connectionOptions.subscribers : []),
            path.join(__dirname, 'subscribers', '*{.ts,.js}'),
        ],
    };

    return connectionOptions;
}

export async function buildDatabaseConnectionOptions(options?: ConnectionOptions) {
    let connectionOptions;

    try {
        connectionOptions = await buildConnectionOptions(options);
        connectionOptions.logging = ['error'];
    } catch (e) {
        connectionOptions = {
            name: 'default',
            type: 'better-sqlite3',
            database: path.join(process.cwd(), 'writable', process.env.NODE_ENV === 'test' ? 'test.sql' : 'db.sql'),
            subscribers: [],
            migrations: [],
            logging: ['error'],
        };
    }

    return modifyDatabaseConnectionOptions(connectionOptions);
}
