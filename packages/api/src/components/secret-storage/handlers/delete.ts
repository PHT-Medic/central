/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SecretStorageSavePayload } from '../type';
import { SecretStorageEntityType } from '../constants';
import { deleteRobotFromSecretStorage } from './entities/robot';
import { deleteUserSecretsFromSecretStorage } from './entities/user';

export async function deleteFromSecretStorage(data: SecretStorageSavePayload) {
    switch (data.type) {
        case SecretStorageEntityType.ROBOT:
            await deleteRobotFromSecretStorage(data);
            break;
        case SecretStorageEntityType.USER_SECRETS:
            await deleteUserSecretsFromSecretStorage(data);
            break;
    }
}
