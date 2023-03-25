/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ServerError } from '@ebec/http';
import { PermissionKey, ServiceID } from '@personalhealthtrain/central-common';
import type {
    Permission,
    Realm, Robot, Role,
} from '@authup/common';
import { REALM_MASTER_NAME, ROBOT_SYSTEM_NAME } from '@authup/common';
import { isClientError } from 'hapic';
import { PresetRoleName, getPresetRolePermissions, useLogger } from '../../config';
import { useAuthupClient } from '../../core';

export async function setupAuthupService(): Promise<any> {
    const authupClient = await useAuthupClient();

    // -------------------------------------------------

    let realm : Realm;

    try {
        realm = await authupClient.realm.getOne(REALM_MASTER_NAME);
    } catch (e) {
        console.log(e);
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
            realm_id: null,
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

        useLogger().debug(`Robot ${ServiceID.REGISTRY} created.`);
    } else {
        useLogger().debug(`Robot ${ServiceID.REGISTRY} already exists.`);
    }

    // -------------------------------------------------

    /**
     * Create permissions
     */
    const permissionNames = Object.values(PermissionKey);
    for (let i = 0; i < permissionNames.length; i++) {
        let permission : Permission;

        try {
            permission = await authupClient.permission.create({
                name: permissionNames[i],
            });

            useLogger().debug(`Created permission ${permissionNames[i]}`);
        } catch (e) {
            if (isClientError(e) && e.response.status === 409) {
                useLogger().debug(`Permission ${permissionNames[i]} already exists`);

                const { data: permissions } = await authupClient.permission.getMany({
                    filter: {
                        realm_id: null,
                        name: permissionNames[i],
                    },
                });

                // eslint-disable-next-line prefer-destructuring
                permission = permissions[0];
            } else {
                throw e;
            }
        }

        if (roleEntity) {
            try {
                await authupClient.rolePermission.create({
                    permission_id: permission.id,
                    role_id: roleEntity.id,
                });

                useLogger().debug(`Created permission ${permissionNames[i]} for admin role.`);
            } catch (e) {
                if (!isClientError(e) || e.response.status !== 409) {
                    throw e;
                }
            }
        }

        if (robotEntity) {
            try {
                await authupClient.robotPermission.create({
                    permission_id: permission.id,
                    robot_id: robotEntity.id,
                });

                useLogger().debug(`Created permission ${permissionNames[i]} for system robot.`);
            } catch (e) {
                if (!isClientError(e) || e.response.status !== 409) {
                    throw e;
                }
            }
        }
    }

    // -------------------------------------------------

    /**
     * Create roles
     */
    const roleNames = Object.values(PresetRoleName);
    for (let i = 0; i < roleNames.length; i++) {
        const names = getPresetRolePermissions(roleNames[i]);

        const { data: permissions } = await authupClient.permission.getMany({
            filter: {
                name: names,
            },
        });

        let role : Role;

        const { data: roles } = await authupClient.role.getMany({
            filter: {
                realm_id: null,
                name: roleNames[i],
            },
        });

        if (roles.length === 0) {
            role = await authupClient.role.create({
                name: roleNames[i],
            });

            useLogger().debug(`Created role ${roleNames[i]}`);
        } else {
            // eslint-disable-next-line prefer-destructuring
            role = roles[0];

            useLogger().debug(`Role ${permissionNames[i]} already exists`);
        }

        for (let i = 0; i < permissions.length; i++) {
            try {
                await authupClient.rolePermission.create({
                    role_id: role.id,
                    permission_id: permissions[i].id,
                });
            } catch (e) {
                if (!isClientError(e) || e.response.status !== 409) {
                    throw e;
                }
            }
        }
    }
}
