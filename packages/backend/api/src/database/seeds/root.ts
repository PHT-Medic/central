/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Connection, In, getRepository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
    RealmEntity,
    RobotEntity,
    RoleEntity,
    RolePermissionEntity,
    RoleRepository,
    useRobotEventEmitter,
} from '@authelion/api-core';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MASTER_REALM_ID, createNanoID } from '@authelion/common';
import { PHTStationRole, getPHTStationRolePermissions } from '../../config/pht/permissions/station';
import { StationEntity } from '../../domains/core/station/entity';

// ----------------------------------------------

export class DatabaseRootSeeder implements Seeder {
    public async run(connection: Connection): Promise<any> {
        /**
         * Create robot accounts for services.
         */

        const services : ServiceID[] = Object.values(ServiceID);
        const robotRepository = getRepository(RobotEntity);
        let robots = await robotRepository.createQueryBuilder('robot')
            .where({
                name: In(services),
            })
            .getMany();

        const serviceSecrets : {[K in ServiceID]?: string} = {};

        robots = services
            .filter((service) => robots.findIndex((robot) => robot.name === service) === -1)
            .map((service) => {
                const secret = createNanoID(undefined, 64);
                serviceSecrets[service] = secret;

                return robotRepository.create({
                    name: service,
                    secret,
                    realm_id: MASTER_REALM_ID,
                });
            });

        await robotRepository.save(robots);

        for (let i = 0; i < robots.length; i++) {
            useRobotEventEmitter()
                .emit('credentials', {
                    id: robots[i].id,
                    name: robots[i].name,
                    secret: serviceSecrets[robots[i].name] || robots[i].secret,
                });
        }

        // -------------------------------------------------

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
                secure_id: createNanoID('0123456789abcdefghijklmnopqrstuvwxyz', 30),
            });
        }

        await stationRepository.insert(stations);
    }
}
