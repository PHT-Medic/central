import {Connection} from "typeorm";
import {RoleRepository} from "../../domains/auth/role/repository";
import {Role} from "../../domains/auth/role";
import {RolePermission} from "../../domains/auth/role/permission";
import {Realm} from "../../domains/auth/realm";
import {MasterImage} from "../../domains/pht/master-image";
import {Station} from "../../domains/pht/station";
import {Factory, Seeder} from "typeorm-seeding";
import {getPHTStationRolePermissions, PHTStationRole} from "../../config/pht/permissions/station";

// ----------------------------------------------

export default class CreatePHT implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        /**
         * Create PHT roles
         */
        const roleNames : PHTStationRole[] = [
            'StationAuthority', // 0
            'StationEmployee' // 1
        ];

        const roleRepository = connection.getCustomRepository(RoleRepository);

        const roles : Role[] = roleNames.map((role: string) => {
            return roleRepository.create({
                name: role,
                provider_role_id: role
            });
        });

        await roleRepository.save(roles);

        // -------------------------------------------------

        /**
         * Create PHT role - permission association
         */
        const rolePermissionRepository = connection.getRepository(RolePermission);
        const rolePermissions : RolePermission[] = roles
            .map(role => {
                return getPHTStationRolePermissions(role.name as PHTStationRole).map(permission => {
                    return rolePermissionRepository.create({
                        role_id: role.id,
                        permission_id: permission
                    });
                });
            })
            .reduce((accumulator, entity) => [...accumulator, ...entity]);

        await rolePermissionRepository.save(rolePermissions);

        // -------------------------------------------------

        /**
         * Create PHT master images
         */
        const masterImageRepository = connection.getRepository(MasterImage);
        const masterImageNames : string[] = [
            'slim',
            'buster',
            'dl',
            'nfdemo',
            'isicdemo'
        ];

        const masterImages: MasterImage[] = masterImageNames.map((name: string) => {
            return masterImageRepository.create({
                name,
                external_tag_id: name
            })
        });

        await masterImageRepository.save(masterImages);

        // -------------------------------------------------

        /**
         * Create PHT default realms
         */
        const realms : Partial<Realm>[] = [
            {id: 'station_1', name: 'University Augsburg'},
            {id: 'station_2', name: 'University Munich'},
            {id: 'station_3', name: 'University Tuebingen'},
        ];
        const realmRepository = connection.getRepository(Realm);
        await realmRepository.insert(realms);

        // -------------------------------------------------

        /**
         * Promote all PHT default realms to a station.
         */
        const stationRepository = connection.getRepository(Station);
        const stations : Partial<Station>[] = [];
        for (let i=0; i<realms.length; i++) {
            stations.push({
                realm_id: realms[i].id,
                name: realms[i].name
            });
        }

        await stationRepository.insert(stations);
    }
}
