/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ServerError } from '@ebec/http';
import type { DataSource } from 'typeorm';
import type { Seeder } from 'typeorm-extension';
import { ServiceID } from '@personalhealthtrain/central-common';
import type { Realm } from '@authup/common';
import { REALM_MASTER_NAME } from '@authup/common';
import { PresetRoleName, getPresetRolePermissions } from '../../config';
import { useAuthupClient } from '../../core';

// ----------------------------------------------

// todo: maybe move to rest endpoint ^^ ;)

export class DatabaseRootSeeder implements Seeder {
    public async run(_dataSource: DataSource): Promise<any> {
        const authupClient = await useAuthupClient();
        let realm : Realm;

        try {
            realm = await authupClient.realm.getOne(REALM_MASTER_NAME);
        } catch (e) {
            throw new ServerError(`The ${REALM_MASTER_NAME} does not exist.`);
        }

        /**
         * Create robot accounts for services.
         */
        const services : ServiceID[] = [
            ServiceID.REGISTRY,
            ServiceID.GITHUB,
        ];
        const { data: robots } = await authupClient.robot.getMany({
            filter: {
                name: services,
            },
        });

        for (let i = 0; i < services.length; i++) {
            const index = robots.findIndex((robot) => robot.name === services[i]);
            if (index !== -1) {
                continue;
            }

            await authupClient.robot.create({
                name: services[i],
                realm_id: realm.id,
            });
        }

        // -------------------------------------------------

        /**
         * Create PHT roles
         */
        const roleNames = Object.values(PresetRoleName);
        for (let i = 0; i < roleNames.length; i++) {
            const names = getPresetRolePermissions(roleNames[i]);

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
}
