/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import zod from 'zod';

export const RegistryHookSchema = zod.object({
    type: zod.string(),
    operator: zod.string().min(3).max(128),
    event_data: zod.object({
        repository: zod.object({
            name: zod.string().min(3).max(128),
            repo_full_name: zod.string().min(3).max(256),
            namespace: zod.string().min(3).max(128),
        }),
        resources: zod.array(zod.object({
            digest: zod.string(),
            tag: zod.string().min(1).max(100),
            resource_url: zod.string(),
        })),
    }),
});
