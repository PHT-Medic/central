/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventName, DomainEventSubscriptionName, DomainSubType, DomainType,
} from './constants';
import type { MasterImageEventContext } from './master-image';
import type { MasterImageGroupEventContext } from './master-image-group';
import type { ProposalEventContext } from './proposal';
import type { ProposalStationEventContext } from './proposal-station';
import type { RegistryEventContext } from './registry';
import type { RegistryProjectEventContext } from './registry-project';
import type { StationEventContext } from './station';
import type { TrainEventContext } from './train';
import type { TrainFileEventContext } from './train-file';
import type { TrainLogEventContext } from './train-log';
import type { TrainStationEventContext } from './train-station';
import type { UserSecretEventContext } from './user-secret';

export type DomainsEventContext = MasterImageEventContext |
MasterImageGroupEventContext |
ProposalEventContext |
ProposalStationEventContext |
RegistryEventContext |
RegistryProjectEventContext |
StationEventContext |
TrainEventContext |
TrainLogEventContext |
TrainFileEventContext |
TrainStationEventContext |
UserSecretEventContext;

export type DomainEventContext<T extends `${DomainType}` | `${DomainSubType}`> =
    T extends `${DomainType.MASTER_IMAGE}` ?
        MasterImageEventContext :
        T extends `${DomainType.MASTER_IMAGE_GROUP}` ?
            MasterImageGroupEventContext :
            T extends `${DomainType.PROPOSAL}` ?
                ProposalEventContext :
                T extends `${DomainType.PROPOSAL_STATION}` | `${DomainSubType.PROPOSAL_STATION_IN}` | `${DomainSubType.PROPOSAL_STATION_OUT}` ?
                    ProposalStationEventContext :
                    T extends `${DomainType.REGISTRY}` ?
                        RegistryEventContext :
                        T extends `${DomainType.REGISTRY_PROJECT}` ?
                            RegistryProjectEventContext :
                            T extends `${DomainType.STATION}` ?
                                StationEventContext :
                                T extends `${DomainType.TRAIN}` ?
                                    TrainEventContext :
                                    T extends `${DomainType.TRAIN_LOG}` ?
                                        TrainLogEventContext :
                                        T extends `${DomainType.TRAIN_FILE}` ?
                                            TrainFileEventContext :
                                            T extends `${DomainType.TRAIN_STATION}` | `${DomainSubType.TRAIN_STATION_IN}` | `${DomainSubType.TRAIN_STATION_OUT}` ?
                                                TrainStationEventContext :
                                                T extends `${DomainType.USER_SECRET}` ?
                                                    UserSecretEventContext :
                                                    never;

export type DomainInput = `${DomainType}` | DomainType | `${DomainSubType}` | DomainSubType;

export type DomainEventFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventName}`>}`;

export type DomainEventSubscriptionFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventSubscriptionName}`>}`;
