/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '../../utils';

export function generateRegistryProjectId() {
    return createNanoID('0123456789abcdefghijklmnopqrstuvwxyz');
}
