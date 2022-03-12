/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot, User } from '@authelion/common';
import { Station } from '@personalhealthtrain/central-common';
import { Stat } from 'isomorphic-git';
import { SecretStorageQueueEntityType } from './constants';

export type SecretStorageRobotQueuePayload = {
    type: SecretStorageQueueEntityType.ROBOT,
    name: Robot['name'],
    id?: Robot['id'],
    secret?: Robot['secret']
};

export type SecretStorageUserSecretsQueuePayload = {
    type: SecretStorageQueueEntityType.USER_SECRETS,
    id: User['id']
};

export type SecretStorageStationQueuePayload = {
    type: SecretStorageQueueEntityType.STATION,
    id: Station['id']
} & Partial<Station>;

export type SecretStorageQueuePayload =
    SecretStorageRobotQueuePayload |
    SecretStorageUserSecretsQueuePayload |
    SecretStorageStationQueuePayload;

// ---------------------------------------------------
