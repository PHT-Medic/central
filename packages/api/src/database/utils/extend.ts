/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { hasClient, hasConfig } from 'redis-extension';
import type { DataSourceOptions } from 'typeorm';
import {
    MasterImageEntity,
    MasterImageGroupEntity,
    ProposalEntity,
    ProposalStationEntity,
    RegistryEntity,
    RegistryProjectEntity,
    StationEntity,
    TrainEntity,
    TrainFileEntity,
    TrainLogEntity,
    TrainStationEntity, UserSecretEntity,
} from '../../domains';
import { DatabaseQueryResultCache } from '../cache';
import { ProposalSubscriber } from '../subscribers/proposal';
import { ProposalStationSubscriber } from '../subscribers/proposal-station';
import { RegistryProjectSubscriber } from '../subscribers/registry-project';
import { StationSubscriber } from '../subscribers/station';
import { TrainSubscriber } from '../subscribers/train';
import { TrainFileSubscriber } from '../subscribers/train-file';
import { TrainLogSubscriber } from '../subscribers/train-log';
import { TrainStationSubscriber } from '../subscribers/train-station';

export function extendDataSourceOptions(options: DataSourceOptions) : DataSourceOptions {
    options = {
        ...options,
        logging: false,
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
        migrations: [
            `src/database/migrations/${options.type}/*{.ts,.js}`,
        ],
        migrationsTransactionMode: 'each',
        subscribers: [
            ...(options.subscribers ? options.subscribers : []) as string[],
            ProposalSubscriber,
            ProposalStationSubscriber,
            RegistryProjectSubscriber,
            StationSubscriber,
            TrainSubscriber,
            TrainFileSubscriber,
            TrainLogSubscriber,
            TrainStationSubscriber,
        ],
    };

    if (hasClient() || hasConfig()) {
        Object.assign(options, {
            cache: {
                provider() {
                    return new DatabaseQueryResultCache();
                },
            },
        } as Partial<DataSourceOptions>);
    }

    return options;
}
