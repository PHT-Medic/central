/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProjectRelinkPayload } from '../../type';
import { linkRegistryProject } from './link';
import { unlinkRegistryProject } from './unlink';

export async function relinkRegistryProject(
    payload: RegistryProjectRelinkPayload,
) {
    await unlinkRegistryProject(payload);

    await linkRegistryProject(payload);
}
