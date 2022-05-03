/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type PHTStationRole = 'StationAuthority' | 'StationEmployee';

export function getPHTStationRolePermissions(type: PHTStationRole) : string[] {
    // eslint-disable-next-line default-case
    switch (type) {
        case 'StationEmployee':
            return [
                'proposal_add',
                'proposal_drop',
                'proposal_edit',

                'train_add',
                'train_execution_start',
                'train_execution_stop',
                'train_drop',
                'train_result_read',
            ];
        case 'StationAuthority':
            return [
                'proposal_add',
                'proposal_drop',
                'proposal_edit',
                'proposal_approve',

                'train_approve',
                'train_edit',
                'train_add',
                'train_execution_start',
                'train_execution_stop',
                'train_drop',
                'train_result_read',
            ];
    }

    return [];
}
