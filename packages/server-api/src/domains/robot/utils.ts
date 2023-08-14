/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@personalhealthtrain/core';
import type { RobotVaultPayload } from './type';

export function isRobotVaultPayload(input: unknown) : input is RobotVaultPayload {
    if (!isObject(input)) {
        return false;
    }

    const { id, secret } = input as RobotVaultPayload;

    return typeof id === 'string' &&
        typeof secret === 'string';
}
