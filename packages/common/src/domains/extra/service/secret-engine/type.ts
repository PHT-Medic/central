/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretStorageCommand } from './constants';

export type ServiceSecretEngineSecretPayload = {
    id: string,
    secret: string
};
export type SecretStorageCommandType = `${SecretStorageCommand}`;
export type SecretStorageEngineSecretPayload<T extends Record<string, any>> = {
    data: T,
    options: {
        cas: number
    }
};
