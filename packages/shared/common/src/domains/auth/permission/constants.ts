/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID as AuthPermissionID } from '@authelion/common';

export enum PermissionKey {
    PROPOSAL_ADD = 'proposal_add',
    PROPOSAL_DROP = 'proposal_drop',
    PROPOSAL_EDIT = 'proposal_edit',
    PROPOSAL_APPROVE = 'proposal_approve',

    REGISTRY_MANAGE = 'registry_manage',

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
    MASTER_IMAGE_GROUP_MANAGE = 'master_image_group_manage',

    SERVICE_MANAGE = 'service_manage',
    CLIENT_MANAGE = 'client_manage',
}

export const PermissionID = {
    ...PermissionKey,
    ...AuthPermissionID,
};
