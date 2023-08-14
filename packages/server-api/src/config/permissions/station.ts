/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionIDType } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';

export enum PresetRoleName {
    STATION_AUTHORITY = 'StationAuthority',
    STATION_EMPLOYEE = 'StationEmployee',
}

export function getPresetRolePermissions(type: string) : PermissionIDType[] {
    const map : Record<string, PermissionIDType[]> = {
        [PresetRoleName.STATION_EMPLOYEE]: [
            PermissionID.PROPOSAL_ADD,
            PermissionID.PROPOSAL_DROP,
            PermissionID.PROPOSAL_EDIT,

            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
            PermissionID.TRAIN_RESULT_READ,
        ],
        [PresetRoleName.STATION_AUTHORITY]: [
            PermissionID.ADMIN_UI_USE,

            PermissionID.ROBOT_ADD,
            PermissionID.ROBOT_DROP,
            PermissionID.ROBOT_EDIT,

            PermissionID.PROPOSAL_ADD,
            PermissionID.PROPOSAL_DROP,
            PermissionID.PROPOSAL_EDIT,
            PermissionID.PROPOSAL_APPROVE,

            PermissionID.STATION_ADD,
            PermissionID.STATION_DROP,
            PermissionID.STATION_EDIT,

            PermissionID.PROVIDER_ADD,
            PermissionID.PROVIDER_DROP,
            PermissionID.PROVIDER_EDIT,

            PermissionID.REGISTRY_PROJECT_MANAGE,

            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_DROP,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_APPROVE,
            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
            PermissionID.TRAIN_RESULT_READ,

            PermissionID.USER_ADD,
            PermissionID.USER_EDIT,
            PermissionID.USER_DROP,
        ],
    };

    return map[type] || [];
}
