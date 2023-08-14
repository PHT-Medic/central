/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject, Train } from '@personalhealthtrain/core';

export type ComponentPayloadExtended<T extends Record<string, any>> = T & {
    entity: Train,

    registry: Registry,

    registryProject?: RegistryProject
};
