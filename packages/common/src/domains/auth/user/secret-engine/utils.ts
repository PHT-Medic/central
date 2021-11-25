/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { USER_SECRET_ENGINE_KEY } from './constants';

export function isSecretStorageUserKey(name: string): boolean {
    return name.startsWith(`${USER_SECRET_ENGINE_KEY}/`);
}

export function getSecretStorageUserKey(name: string): string {
    return name.replace(`${USER_SECRET_ENGINE_KEY}/`, '');
}

export function buildSecretStorageUserKey(id: string | number): string {
    return `${USER_SECRET_ENGINE_KEY}/${id}`;
}
