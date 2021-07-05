export type PHTStationRole = 'StationAuthority' | 'StationEmployee';

export function getPHTStationRolePermissions(type: PHTStationRole) : string[] {
    switch (type) {
        case "StationEmployee":
            return [
                'proposal_add',
                'proposal_drop',
                'proposal_edit',

                'train_add',
                'train_execution_start',
                'train_execution_stop',
                'train_drop',
                'train_result_read'
            ];
        case "StationAuthority":
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
}
