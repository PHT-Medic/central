/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot, User } from '@authup/common';
import type { Station } from '@personalhealthtrain/central-common';
import type { SecretStorageCommand, SecretStorageEntityType } from './constants';

export type SecretStorageRobotDeletePayload = {
    type: SecretStorageEntityType.ROBOT,
    name: Robot['name'],
};

export type SecretStorageRobotSavePayload = SecretStorageRobotDeletePayload & {
    id: Robot['id'],
    secret: Robot['secret']
};

export type SecretStorageUserSecretsPayload = {
    type: SecretStorageEntityType.USER_SECRETS,
    id: User['id']
};

export type SecretStorageStationPayload = {
    type: SecretStorageEntityType.STATION,
    id: Station['id']
} & Partial<Station>;

export type SecretStorageSavePayload =
    SecretStorageRobotSavePayload |
    SecretStorageUserSecretsPayload |
    SecretStorageStationPayload;

export type SecretStorageDeletePayload =
    SecretStorageRobotDeletePayload |
    SecretStorageUserSecretsPayload |
    SecretStorageStationPayload;

// ---------------------------------------------------

export type SecretStorageSaveCommendContext = {
    data: SecretStorageSavePayload,
    command: `${SecretStorageCommand.SAVE}`
};

export type SecretStorageDeleteCommendContext = {
    data: SecretStorageDeletePayload,
    command: `${SecretStorageCommand.DELETE}`,
};

export type SecretStorageCommandContext = SecretStorageSaveCommendContext |
SecretStorageDeleteCommendContext;
