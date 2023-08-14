/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventName, DomainEventSubscriptionName, DomainSubType, DomainType,
} from './constants';
import type { MasterImage, MasterImageEventContext } from './master-image';
import type { MasterImageGroup, MasterImageGroupEventContext } from './master-image-group';
import type { Proposal, ProposalEventContext } from './proposal';
import type { ProposalStation, ProposalStationEventContext } from './proposal-station';
import type { Registry, RegistryEventContext } from './registry';
import type { RegistryProject, RegistryProjectEventContext } from './registry-project';
import type { Station, StationEventContext } from './station';
import type { Train, TrainEventContext } from './train';
import type { TrainFile, TrainFileEventContext } from './train-file';
import type { TrainLog, TrainLogEventContext } from './train-log';
import type { TrainStation, TrainStationEventContext } from './train-station';
import type { UserSecret, UserSecretEventContext } from './user-secret';

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

export type DomainEntity<T extends `${DomainType}` | `${DomainSubType}`> =
    T extends `${DomainType.MASTER_IMAGE}` ?
        MasterImage :
        T extends `${DomainType.MASTER_IMAGE_GROUP}` ?
            MasterImageGroup :
            T extends `${DomainType.PROPOSAL}` ?
                Proposal :
                T extends `${DomainType.PROPOSAL_STATION}` | `${DomainSubType.PROPOSAL_STATION_IN}` | `${DomainSubType.PROPOSAL_STATION_OUT}` ?
                    ProposalStation :
                    T extends `${DomainType.REGISTRY}` ?
                        Registry :
                        T extends `${DomainType.REGISTRY_PROJECT}` ?
                            RegistryProject :
                            T extends `${DomainType.STATION}` ?
                                Station :
                                T extends `${DomainType.TRAIN}` ?
                                    Train :
                                    T extends `${DomainType.TRAIN_LOG}` ?
                                        TrainLog :
                                        T extends `${DomainType.TRAIN_FILE}` ?
                                            TrainFile :
                                            T extends `${DomainType.TRAIN_STATION}` | `${DomainSubType.TRAIN_STATION_IN}` | `${DomainSubType.TRAIN_STATION_OUT}` ?
                                                TrainStation :
                                                T extends `${DomainType.USER_SECRET}` ?
                                                    UserSecret :
                                                    never;

export type DomainInput = `${DomainType}` | DomainType | `${DomainSubType}` | DomainSubType;

export type DomainEventFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventName}`>}`;

export type DomainEventSubscriptionFullName<
    T extends DomainInput = DomainInput,
> = `${T}${Capitalize<`${DomainEventSubscriptionName}`>}`;
