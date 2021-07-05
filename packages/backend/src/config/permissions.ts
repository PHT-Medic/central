import {getPHTPermissions} from "./pht/permissions";

const permissions : string[] = [
    'admin_ui_use',

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

export function getPermissions(includePHT: boolean = true) : string[] {
    if(includePHT) {
        return [...permissions, ...getPHTPermissions()];
    }
}
