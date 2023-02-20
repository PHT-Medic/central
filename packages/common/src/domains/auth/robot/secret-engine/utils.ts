/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ROBOT_SECRET_ENGINE_KEY } from './constants';
import type { RobotSecretEnginePayload } from './type';

export function buildRobotSecretStoragePayload(
    id: string,
    secret: string,
): RobotSecretEnginePayload {
    return {
        id,
        secret,
    };
}

export function isRobotSecretStorageKey(name: string): boolean {
    return name.startsWith(`${ROBOT_SECRET_ENGINE_KEY}/`);
}

export function getRobotSecretStorageKey(name: string): string {
    return name.replace(`${ROBOT_SECRET_ENGINE_KEY}/`, '');
}

export function buildRobotSecretStorageKey(id: string | number): string {
    return `${ROBOT_SECRET_ENGINE_KEY}/${id}`;
}
