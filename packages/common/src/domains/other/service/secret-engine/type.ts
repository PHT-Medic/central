/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum SecretStorageCommand {
    ENGINE_CREATE = 'engineCreate',

    ENGINE_KEY_SAVE = 'engineKeySave',
    ENGINE_KEY_PULL = 'engineKeyPull',
    ENGINE_KEY_DROP = 'engineKeyDrop'
}

export type SecretStorageCommandType = `${SecretStorageCommand}`;
