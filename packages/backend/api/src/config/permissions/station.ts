/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, PermissionIDType, PermissionKey } from '@personalhealthtrain/central-common';

export type PHTStationRole = 'StationAuthority' | 'StationEmployee';

export function getPHTStationRolePermissions(type: PHTStationRole) : PermissionIDType[] {
    // eslint-disable-next-line default-case
    switch (type) {
        case 'StationEmployee':
            return [
                PermissionID.PROPOSAL_ADD,
                PermissionID.PROPOSAL_DROP,
                PermissionID.PROPOSAL_EDIT,

                PermissionID.TRAIN_ADD,
                PermissionID.TRAIN_EDIT,
                PermissionID.TRAIN_EXECUTION_START,
                PermissionID.TRAIN_EXECUTION_STOP,
                PermissionID.TRAIN_RESULT_READ,
            ];
        case 'StationAuthority':
            return [
                PermissionID.ADMIN_UI_USE,

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
            ];
    }

    return [];
}
