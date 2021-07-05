let permissionNames = [
    'proposal_add', // 0 : [0,1]
    'proposal_drop', // 1 : [0,1]
    'proposal_edit', // 2 : [0,1]
    'proposal_approve', //3 : [0]
    'train_approve', // 4 : [0]
    'train_edit', // 5 : [0]
    'train_add', // 6 : [0,1]
    'train_execution_start', // 7 : [0,1]
    'train_execution_stop', // 8 : [0,1]
    'train_drop', // 9 : [0,1]
    'train_result_read', // 10 : [0,1]
];

export function getPhtPermissions() {
    return permissionNames;
}

export function getPhtRolePermissions() {

}
