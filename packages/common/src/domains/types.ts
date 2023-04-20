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
import type { UserSecretSecretEventContext } from './user-secret';

export type DomainEventContext = MasterImageEventContext |
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
UserSecretSecretEventContext;

export type DomainEventSubscriptionContext = {
    event: `${DomainEventSubscriptionName}`,
    target?: string | number
};

export type DomainEventFullName<
    T extends `${DomainType}` | `${DomainSubType}` = `${DomainType}` | `${DomainSubType}`,
> = `${T}${Capitalize<`${DomainEventName}`>}`;
export type DomainEventSubscriptionFullName<
    T extends `${DomainType}` | `${DomainSubType}` = `${DomainType}` | `${DomainSubType}`,
> = `${T}${Capitalize<`${DomainEventSubscriptionName}`>}`;
