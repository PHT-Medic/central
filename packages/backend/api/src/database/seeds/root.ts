/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
    RobotEntity,
    RobotRepository,
    RoleEntity,
    RolePermissionEntity,
    RoleRepository,
    useRobotEventEmitter,
} from '@authelion/api-core';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MASTER_REALM_ID } from '@authelion/common';
import { PHTStationRole, getPHTStationRolePermissions } from '../../config/permissions/station';

// ----------------------------------------------

export class DatabaseRootSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<any> {
        /**
         * Create robot accounts for services.
         */

        const services : ServiceID[] = [
            ServiceID.REGISTRY,
            ServiceID.SYSTEM,

            ServiceID.GITHUB,
        ];

        const robotRepository = new RobotRepository(dataSource);
        const robots = await robotRepository.createQueryBuilder('robot')
            .where({
                name: In(services),
            })
            .getMany();

        const serviceSecrets : {[K in ServiceID]?: string} = {};

        for (let i = 0; i < services.length; i++) {
            const index = robots.findIndex((robot) => robot.name === services[i]);
            if (index !== -1) {
                continue;
            }

            const { entity, secret } = await robotRepository.createWithSecret({
                name: services[i],
                realm_id: MASTER_REALM_ID,
            });

            robots.push(entity as RobotEntity);

            serviceSecrets[services[i]] = secret;
        }

        await robotRepository.save(robots);

        for (let i = 0; i < robots.length; i++) {
            useRobotEventEmitter()
                .emit('credentials', {
                    id: robots[i].id,
                    name: robots[i].name,
                    secret: serviceSecrets[robots[i].name],
                });
        }

        // -------------------------------------------------

        // todo: check existence and update entries

        /**
         * Create PHT roles
         */
        const roleNames : PHTStationRole[] = [
            'StationAuthority', // 0
            'StationEmployee', // 1
        ];

        const roleRepository = new RoleRepository(dataSource);

        const roles : RoleEntity[] = roleNames.map((role: string) => roleRepository.create({ name: role }));

        await roleRepository.save(roles);

        // -------------------------------------------------

        /**
         * Create PHT role - permission association
         */
        const rolePermissionRepository = dataSource.getRepository(RolePermissionEntity);
        const rolePermissions : RolePermissionEntity[] = roles
            .map((role) => getPHTStationRolePermissions(role.name as PHTStationRole).map((permission) => rolePermissionRepository.create({
                role_id: role.id,
                permission_id: permission,
            })))
            .reduce((accumulator, entity) => [...accumulator, ...entity]);

        await rolePermissionRepository.save(rolePermissions);
    }
}
