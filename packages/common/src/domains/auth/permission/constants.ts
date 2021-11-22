/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum PermissionID {
    ADMIN_UI_USE = 'admin_ui_use',

    SERVICE_MANAGE = 'service_manage',
    PERMISSION_MANAGE = 'permission_manage',

    REALM_ADD = 'realm_add',
    REALM_DROP = 'realm_drop',
    REALM_EDIT = 'realm_edit',

    USER_ADD = 'user_add',
    USER_DROP = 'user_drop',
    USER_EDIT = 'user_edit',

    USER_PERMISSION_ADD = 'user_permission_add',
    USER_PERMISSION_DROP = 'user_permission_drop',

    USER_ROLE_ADD = 'user_role_add',
    USER_ROLE_DROP = 'user_role_drop',
    USER_ROLE_EDIT = 'user_role_edit',

    ROLE_ADD = 'role_add',
    ROLE_DROP = 'role_drop',
    ROLE_EDIT = 'role_edit',

    ROLE_PERMISSION_ADD = 'role_permission_add',
    ROLE_PERMISSION_DROP = 'role_permission_drop',

    PROVIDER_ADD = 'provider_add',
    PROVIDER_DROP = 'provider_drop',
    PROVIDER_EDIT = 'provider_edit',

    //

    PROPOSAL_ADD = 'proposal_add',
    PROPOSAL_DROP = 'proposal_drop',
    PROPOSAL_EDIT = 'proposal_edit',
    PROPOSAL_APPROVE = 'proposal_approve',

    STATION_ADD = 'station_add',
    STATION_DROP = 'station_drop',
    STATION_EDIT = 'station_edit',

    TRAIN_APPROVE = 'train_approve',
    TRAIN_EDIT = 'train_edit',
    TRAIN_ADD = 'train_add',
    TRAIN_EXECUTION_START = 'train_execution_start',
    TRAIN_EXECUTION_STOP = 'train_execution_stop',
    TRAIN_DROP = 'train_drop',
    TRAIN_RESULT_READ = 'train_result_read',

    MASTER_IMAGE_MANAGE = 'master_image_manage',
    MASTER_IMAGE_GROUP_MANAGE = 'master_image_group_manage'
}
