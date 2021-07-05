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
    'train_result_read'
];

export function getPHTPermissions() : string[] {
    return permissionNames;
}
