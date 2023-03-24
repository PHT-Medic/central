/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ServerError } from '@ebec/http';
import { PermissionKey, ServiceID } from '@personalhealthtrain/central-common';
import type {
    Realm, Robot, Role,
} from '@authup/common';
import { REALM_MASTER_NAME, ROBOT_SYSTEM_NAME } from '@authup/common';
import { PresetRoleName, getPresetRolePermissions, useLogger } from '../../config';
import { useAuthupClient } from '../../core';

export async function setupAuthupService(): Promise<any> {
    const authupClient = await useAuthupClient();

    // -------------------------------------------------

    let realm : Realm;

    try {
        realm = await authupClient.realm.getOne(REALM_MASTER_NAME);
    } catch (e) {
        throw new ServerError(`The ${REALM_MASTER_NAME} does not exist.`);
    }

    // -------------------------------------------------

    let robotEntity : Robot | undefined;
    const robotResponse = await authupClient.robot.getMany({
        filter: {
            realm_id: realm.id,
            name: ROBOT_SYSTEM_NAME,
        },
    });

    if (robotResponse.data.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        robotEntity = robotResponse.data[0];
    }

    // -------------------------------------------------

    let roleEntity : Role | undefined;
    const roleResponse = await authupClient.role.getMany({
        filter: {
            realm_id: realm.id,
            name: 'admin',
        },
    });

    if (roleResponse.data.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        roleEntity = roleResponse.data[0];
    }

    // -------------------------------------------------

    /**
     * Create registry robot account.
     */
    const { data: robots } = await authupClient.robot.getMany({
        filter: {
            realm_id: realm.id,
            name: ServiceID.REGISTRY,
        },
    });

    if (robots.length === 0) {
        await authupClient.robot.create({
            name: ServiceID.REGISTRY,
            realm_id: realm.id,
        });

        useLogger().debug('Registry Robot created.');
    } else {
        useLogger().debug('Registry Robot already exist.');
    }

    // -------------------------------------------------

    /**
     * Create permissions
     */
    const permissionNames = Object.values(PermissionKey);
    for (let i = 0; i < permissionNames.length; i++) {
        const permission = await authupClient.permission.create({
            name: permissionNames[i],
        });

        useLogger().debug(`Created permission ${permissionNames[i]}`);

        if (roleEntity) {
            await authupClient.rolePermission.create({
                permission_id: permission.id,
                role_id: roleEntity.id,
            });

            useLogger().debug(`Created permission ${permissionNames[i]} for admin role.`);
        }

        if (robotEntity) {
            await authupClient.robotPermission.create({
                permission_id: permission.id,
                robot_id: robotEntity.id,
            });

            useLogger().debug(`Created permission ${permissionNames[i]} for system robot.`);
        }
    }

    // -------------------------------------------------

    /**
     * Create roles
     */
    const roleNames = Object.values(PresetRoleName);
    for (let i = 0; i < roleNames.length; i++) {
        const names = getPresetRolePermissions(roleNames[i]);

        useLogger().debug(`Setup preset role ${roleNames[i]}`);

        const { data: permissions } = await authupClient.permission.getMany({
            filter: {
                name: names,
            },
        });

        const role = await authupClient.role.create({
            name: roleNames[i],
        });

        for (let i = 0; i < permissions.length; i++) {
            await authupClient.rolePermission.create({
                role_id: role.id,
                permission_id: permissions[i].id,
            });
        }
    }
}
