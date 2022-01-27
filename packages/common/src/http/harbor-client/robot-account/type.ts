/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HarborRobotAccountPermissionAccess = {
    resource: 'artifact' |
    'artifact-label' |
    'helm-chart' |
    'helm-chart-version' |
    'repository' |
    'scan' |
    'tag',
    action: 'delete' | 'read' | 'create' | 'pull' | 'push' | 'list' | 'stop'
};

export type HarborRobotAccountPermission = {
    access: HarborRobotAccountPermissionAccess[],
    kind: 'project',
    namespace: string
};

export type HarborRobotAccount = {
    id?: number,
    name: string,
    secret?: string | null,
    creation_time?: string,
    update_time?: string,
    expires_at?: number,
    duration?: number,
    level?: 'system',
    disable?: boolean,
    editable?: boolean,
    permissions?: HarborRobotAccountPermission[]
};
