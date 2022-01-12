/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Realm, Role, RolePermission, Station,
} from '@personalhealthtrain/ui-common';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { RoleRepository } from '../../domains/auth/role/repository';
import { PHTStationRole, getPHTStationRolePermissions } from '../../config/pht/permissions/station';

// ----------------------------------------------

export default class CreatePHT implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        /**
         * Create PHT roles
         */
        const roleNames : PHTStationRole[] = [
            'StationAuthority', // 0
            'StationEmployee', // 1
        ];

        const roleRepository = connection.getCustomRepository(RoleRepository);

        const roles : Role[] = roleNames.map((role: string) => roleRepository.create({ name: role }));

        await roleRepository.save(roles);

        // -------------------------------------------------

        /**
         * Create PHT role - permission association
         */
        const rolePermissionRepository = connection.getRepository(RolePermission);
        const rolePermissions : RolePermission[] = roles
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
        const realms : Partial<Realm>[] = [
            { id: 'station1', name: 'University Augsburg' },
            { id: 'station2', name: 'University Munich' },
            { id: 'station3', name: 'University Tuebingen' },
        ];
        const realmRepository = connection.getRepository(Realm);
        await realmRepository.insert(realms);

        // -------------------------------------------------

        /**
         * Promote all PHT default realms to a station.
         */
        const stationRepository = connection.getRepository(Station);
        const stations : Partial<Station>[] = [];
        for (let i = 0; i < realms.length; i++) {
            stations.push({
                realm_id: realms[i].id,
                name: realms[i].name,
            });
        }

        await stationRepository.insert(stations);
    }
}
