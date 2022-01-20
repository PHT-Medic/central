/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum SecretStorageQueueCommand {
    SAVE = 'SECRET_STORAGE_SAVE',
    DELETE = 'SECRET_STORAGE_DELETE',
}

export enum SecretStorageQueueEntityType {
    USER_SECRETS = 'userSecrets',
    STATION = 'station',
    ROBOT = 'robot',
}
