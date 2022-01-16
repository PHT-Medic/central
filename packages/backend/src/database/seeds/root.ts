/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Connection, In, getRepository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
    RealmEntity, RobotEntity, RoleEntity, RolePermissionEntity, RoleRepository,
} from '@typescript-auth/server';
import { ServiceID } from '@personalhealthtrain/ui-common';
import { MASTER_REALM_ID, createNanoID } from '@typescript-auth/domains';
import { PHTStationRole, getPHTStationRolePermissions } from '../../config/pht/permissions/station';
import { StationEntity } from '../../domains/core/station/entity';
import { buildRobotAggregator } from '../../aggregators/robot';

// ----------------------------------------------

export class DatabaseRootSeeder implements Seeder {
    public async run(connection: Connection): Promise<any> {
        /**
         * Create robot accounts for services.
         */

        const robotAggregator = buildRobotAggregator();
        robotAggregator.start();

        const services : ServiceID[] = Object.values(ServiceID);
        const robotRepository = getRepository(RobotEntity);
        let robots = await robotRepository.createQueryBuilder('robot')
            .where({
                name: In(services),
            })
            .getMany();

        robots = services
            .filter((service) => robots.findIndex((robot) => robot.name === service) === -1)
            .map((service) => robotRepository.create({
                name: service,
                secret: createNanoID(undefined, 64),
                realm_id: MASTER_REALM_ID,
            }));

        await robotRepository.save(robots);

        /**
         * Create PHT roles
         */
        const roleNames : PHTStationRole[] = [
            'StationAuthority', // 0
            'StationEmployee', // 1
        ];

        const roleRepository = connection.getCustomRepository(RoleRepository);

        const roles : RoleEntity[] = roleNames.map((role: string) => roleRepository.create({ name: role }));

        await roleRepository.save(roles);

        // -------------------------------------------------

        /**
         * Create PHT role - permission association
         */
        const rolePermissionRepository = connection.getRepository(RolePermissionEntity);
        const rolePermissions : RolePermissionEntity[] = roles
            .map((role) => getPHTStationRolePermissions(role.name as PHTStationRole).map((permission) => rolePermissionRepository.create({
                role_id: role.id,
                permission_id: permission,
            })))
            .reduce((accumulator, entity) => [...accumulator, ...entity]);

        await rolePermissionRepository.save(rolePermissions);

        // -------------------------------------------------

        /**
         * Create PHT default realms
         */
        const realms : Partial<RealmEntity>[] = [
            { id: 'station1', name: 'University Augsburg' },
            { id: 'station2', name: 'University Munich' },
            { id: 'station3', name: 'University Tuebingen' },
        ];
        const realmRepository = connection.getRepository(RealmEntity);
        await realmRepository.insert(realms);

        // -------------------------------------------------

        /**
         * Promote all PHT default realms to a station.
         */
        const stationRepository = connection.getRepository(StationEntity);
        const stations : Partial<StationEntity>[] = [];
        for (let i = 0; i < realms.length; i++) {
            stations.push({
                realm_id: realms[i].id,
                name: realms[i].name,
            });
        }

        await stationRepository.insert(stations);
    }
}
