import {Connection} from "typeorm";
import {RoleRepository} from "../../domains/role/repository";
import {Role} from "../../domains/role";
import {Permission} from "../../domains/permission";
import {RolePermission} from "../../domains/role/permission";
import {Realm} from "../../domains/realm";
import {MasterImage} from "../../domains/master-image";
import {Station} from "../../domains/station";
import {getPhtPermissions} from "../../config/pht";
import {Factory, Seeder} from "typeorm-seeding";

// ----------------------------------------------

export default class CreatePHT implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        // -------------------------------------------------
        const roleNames : string[] = [
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

        const permissionRepository = connection.getRepository(Permission);
        const permissionNames = getPhtPermissions();
        const permissions : Permission[] = permissionNames.map((name: string) => {
            return permissionRepository.create({
                name
            });
        });

        await permissionRepository.save(permissions);

        // -------------------------------------------------

        const rolePermissionMapping: {[key: number] : number[]} = {
            0: [0,1,2,3,5,6,7,8,9,10],
            1: [0,1,2,6,7,8,9,10]
        };

        const rolePermissionRepository = connection.getRepository(RolePermission);
        const rolePermissions : RolePermission[] = [];
        for(const roleIndex in rolePermissionMapping) {
            for (let j = 0; j < rolePermissionMapping[roleIndex].length; j++) {
                const permissionIndex = rolePermissionMapping[roleIndex][j];
                rolePermissions.push(rolePermissionRepository.create({
                    role_id: roles[roleIndex].id,
                    permission_id: permissions[permissionIndex].id
                }))
            }
        }

        const adminGroup = await roleRepository.findOne({name: 'admin'});
        if(typeof adminGroup !== "undefined") {
            for(let i=0; i<permissions.length; i++) {
                rolePermissions.push(rolePermissionRepository.create({
                    role_id: adminGroup.id,
                    permission_id: permissions[i].id
                }));
            }
        }

        await rolePermissionRepository.save(rolePermissions);

        // -------------------------------------------------


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

        const realms : Partial<Realm>[] = [
            {id: 'station_1', name: 'University Leipzig'},
            {id: 'station_2', name: 'University Achen'},
            {id: 'station_3', name: 'University Tuebingen'},
        ];
        const realmRepository = connection.getRepository(Realm);
        await realmRepository.insert(realms);

        // -------------------------------------------------

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
