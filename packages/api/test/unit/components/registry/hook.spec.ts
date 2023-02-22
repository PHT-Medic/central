/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryHookSchema } from '../../../../src/components';

describe('src/components/registry/hook', () => {
    it('should validate hook schema', () => {
        const payload = {
            type: 'PUSH_ARTIFACT',
            occur_at: 1586922308,
            operator: 'admin',
            event_data: {
                resources: [{
                    digest: 'sha256:8a9e9863dbb6e10edb5adfe917c00da84e1700fa76e7ed02476aa6e6fb8ee0d8',
                    tag: 'latest',
                    resource_url: 'hub.harbor.com/test-webhook/debian:latest',
                }],
                repository: {
                    date_created: 1586922308,
                    name: 'debian',
                    namespace: 'test-webhook',
                    repo_full_name: 'test-webhook/debian',
                    repo_type: 'private',
                },
            },
        };

        const validation = RegistryHookSchema.safeParse(payload);
        expect(validation.success).toBeTruthy();
        if (validation.success) {
            expect(validation.data).toBeDefined();
            expect(validation.data.type).toEqual('PUSH_ARTIFACT');
            expect(validation.data.operator).toEqual('admin');
        }
    });
});
