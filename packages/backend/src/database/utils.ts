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
} from '@typescript-auth/server';
import { MasterImageEntity } from '../domains/core/master-image/entity';
import { MasterImageGroupEntity } from '../domains/core/master-image-group/entity';
import { ProposalEntity } from '../domains/core/proposal/entity';
import { TrainEntity } from '../domains/core/train/entity';
import { StationEntity } from '../domains/core/station/entity';
import { ProposalStationEntity } from '../domains/core/proposal-station/entity';
import { TrainFileEntity } from '../domains/core/train-file/entity';
import { ModelEntity } from '../domains/core/model';
import { TrainResultEntity } from '../domains/core/train-result/entity';
import { TrainStationEntity } from '../domains/core/train-station/entity';
import { UserSecretEntity } from '../domains/auth/user-secret/entity';

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
            ModelEntity,
            TrainResultEntity,
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

export async function buildDatabaseConnectionOptions() {
    const baseOptions = await buildConnectionOptions();

    return modifyDatabaseConnectionOptions(baseOptions);
}
