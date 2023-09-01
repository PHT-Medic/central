/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHash } from 'node:crypto';

export function createUserSecretHash(content: string) : string {
    return createHash('sha256').update(content).digest('hex');
}
