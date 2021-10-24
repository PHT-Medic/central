/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const permissionNames : string[] = [
    'proposal_add',
    'proposal_drop',
    'proposal_edit',
    'proposal_approve',

    'station_add',
    'station_drop',
    'station_edit',

    'train_approve',
    'train_edit',
    'train_add',
    'train_execution_start',
    'train_execution_stop',
    'train_drop',
    'train_result_read',

    'master_image_manage',
    'master_image_group_manage'
];

export function getPHTPermissions() : string[] {
    return permissionNames;
}
