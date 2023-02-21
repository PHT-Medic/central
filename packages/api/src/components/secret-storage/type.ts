/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Robot, User } from '@authup/common';
import type { Station } from '@personalhealthtrain/central-common';
import type { SecretStorageEntityType } from './constants';

export type SecretStorageComponentRobotPayload = {
    type: SecretStorageEntityType.ROBOT,
    name: Robot['name'],
    id?: Robot['id'],
    secret?: Robot['secret']
};

export type SecretStorageComponentUserSecretsPayload = {
    type: SecretStorageEntityType.USER_SECRETS,
    id: User['id']
};

export type SecretStorageComponentStationPayload = {
    type: SecretStorageEntityType.STATION,
    id: Station['id']
} & Partial<Station>;

export type SecretStorageQueuePayload =
    SecretStorageComponentRobotPayload |
    SecretStorageComponentUserSecretsPayload |
    SecretStorageComponentStationPayload;

// ---------------------------------------------------

export type SecretStorageExecuteContext = {
    data: SecretStorageQueuePayload,
    command: string
};
