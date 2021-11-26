/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getPHTPermissions } from './pht/permissions';

const permissions : string[] = [
    'admin_ui_use',

    'service_manage',

    'realm_add',
    'realm_drop',
    'realm_edit',

    'provider_add',
    'provider_drop',
    'provider_edit',

    'user_add',
    'user_drop',
    'user_edit',

    'user_role_add',
    'user_role_drop',
    'user_role_edit',

    'role_add',
    'role_drop',
    'role_edit',

    'role_permission_add',
    'role_permission_drop',
];

export function getPermissions(includePHT = true) : string[] {
    if (includePHT) {
        return [...permissions, ...getPHTPermissions()];
    }

    return [...permissions];
}
