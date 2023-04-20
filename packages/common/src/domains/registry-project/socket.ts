/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from './entity';

export function buildSocketRegistryProjectRoomName(id?: RegistryProject['id']) {
    return `registry-projects${id ? `#${id}` : ''}`;
}
