/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'path';
import { buildDataSourceOptions as _buildDataSourceOptions } from 'typeorm-extension';
import { extendDataSourceOptions } from '@authup/server-database';
import { MasterImageEntity } from '../domains/core/master-image/entity';
import { MasterImageGroupEntity } from '../domains/core/master-image-group/entity';
import { ProposalEntity } from '../domains/core/proposal/entity';
import { TrainLogEntity } from '../domains/core/train-log';
import { TrainEntity } from '../domains/core/train';
import { StationEntity } from '../domains/core/station/entity';
import { ProposalStationEntity } from '../domains/core/proposal-station/entity';
import { TrainFileEntity } from '../domains/core/train-file/entity';
import { TrainStationEntity } from '../domains/core/train-station/entity';
import { UserSecretEntity } from '../domains/core/user-secret/entity';
import { RegistryEntity } from '../domains/core/registry/entity';
import { RegistryProjectEntity } from '../domains/core/registry-project/entity';
import { ProposalSubscriber } from './subscribers/proposal';
import { ProposalStationSubscriber } from './subscribers/proposal-station';
import { RegistryProjectSubscriber } from './subscribers/registry-project';
import { RobotSubscriber } from './subscribers/robot';
import { StationSubscriber } from './subscribers/station';
import { TrainSubscriber } from './subscribers/train';
import { TrainFileSubscriber } from './subscribers/train-file';
import { TrainLogSubscriber } from './subscribers/train-log';
import { TrainStationSubscriber } from './subscribers/train-station';

export async function buildDataSourceOptions() {
    let options;

    try {
        options = await _buildDataSourceOptions();
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

    options = await extendDataSourceOptions(options);

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
            TrainLogEntity,
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
            ProposalSubscriber,
            ProposalStationSubscriber,
            RegistryProjectSubscriber,
            RobotSubscriber,
            StationSubscriber,
            TrainSubscriber,
            TrainFileSubscriber,
            TrainLogSubscriber,
            TrainStationSubscriber,
        ],
    };

    return (options);
}
