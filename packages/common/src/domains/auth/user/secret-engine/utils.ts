/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { USER_SECRETS_SECRET_ENGINE_KEY } from './constants';

export function isUserSecretsSecretStorageKey(name: string): boolean {
    return name.startsWith(`${USER_SECRETS_SECRET_ENGINE_KEY}/`);
}

export function getUserSecretsSecretStorageKey(name: string): string {
    return name.replace(`${USER_SECRETS_SECRET_ENGINE_KEY}/`, '');
}

export function buildUserSecretsSecretStorageKey(id: string | number): string {
    return `${USER_SECRETS_SECRET_ENGINE_KEY}/${id}`;
}
