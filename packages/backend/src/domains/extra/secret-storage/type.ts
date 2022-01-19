/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Robot, User } from '@typescript-auth/domains';
import { Station } from '@personalhealthtrain/ui-common';
import { SecretStorageQueueEntityType } from './constants';

export type SecretStorageSaveRobotQueuePayload = {
    type: SecretStorageQueueEntityType.ROBOT,
    name: Robot['name'],
    id: Robot['id'],
    secret: Robot['secret']
};

export type SecretStorageSaveUserSecretsQueuePayload = {
    type: SecretStorageQueueEntityType.USER_SECRETS,
    id: User['id']
};

export type SecretStorageSaveStationQueuePayload = {
    type: SecretStorageQueueEntityType.STATION,
    id: Station['id']
};

export type SecretStorageSaveQueuePayload =
    SecretStorageSaveRobotQueuePayload |
    SecretStorageSaveUserSecretsQueuePayload |
    SecretStorageSaveStationQueuePayload;

// ---------------------------------------------------

export type SecretStorageDeleteRobotQueuePayload = {
    type: SecretStorageQueueEntityType.ROBOT,
    name: Robot['name']
};

export type SecretStorageDeleteUserSecretsQueuePayload = {
    type: SecretStorageQueueEntityType.USER_SECRETS,
    id: User['id']
};

export type SecretStorageDeleteStationQueuePayload = {
    type: SecretStorageQueueEntityType.STATION,
    id: Station['id']
};

export type SecretStorageDeleteQueuePayload =
    SecretStorageDeleteRobotQueuePayload |
    SecretStorageDeleteUserSecretsQueuePayload |
    SecretStorageDeleteStationQueuePayload;
