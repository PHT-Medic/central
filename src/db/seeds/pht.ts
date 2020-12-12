import {Factory, Seeder} from "typeorm-seeding";
import {Connection} from "typeorm";
import {RoleRepository} from "../../domains/role/repository";
import {Role} from "../../domains/role";
import {Permission} from "../../domains/permission";
import {RolePermission} from "../../domains/role/permission";
import {Realm} from "../../domains/realm";
import {MasterImage} from "../../domains/pht/master-image";
import {Station} from "../../domains/pht/station";

//----------------------------------------------
let roleNames = [
    'StationAuthority', // 0
    'StationEmployee' // 1
];

let permissionNames = [
    'proposal_add', // 0 : [0,1]
    'proposal_drop', // 1 : [0,1]
    'proposal_edit', // 2 : [0,1]
    'proposal_approve', //3 : [0]
    'train_approve', // 4 : [0]
    'train_edit', // 5 : [0]
    'train_add', // 6 : [0,1]
    'train_execution_start', // 7 : [0,1]
    'train_execution_stop', // 8 : [0,1]
    'train_drop', // 9 : [0,1]
    'train_result_read', // 10 : [0,1]
    'station_add', // 11 : []
    'station_drop', // 12 : []
    'station_edit' // 13 : []
];

let rolePermissionMapping: {[key: number] : number[]} = {
    0: [0,1,2,3,5,6,7,8,9,10],
    1: [0,1,2,6,7,8,9,10]
};

export default class CreateBase implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        //-------------------------------------------------

        const roleRepository = connection.getCustomRepository(RoleRepository);

        let roles : Role[] = roleNames.map((role: string) => {
            return roleRepository.create({
                name: role,
                provider_role_id: role
            });
        });

        await roleRepository.save(roles);

        //-------------------------------------------------

        const permissionRepository = connection.getRepository(Permission);
        const permissions : Permission[] = permissionNames.map((name: string) => {
            return permissionRepository.create({
                name
            });
        });

        await permissionRepository.save(permissions);

        //-------------------------------------------------

        const rolePermissionRepository = connection.getRepository(RolePermission);
        let rolePermissions : RolePermission[] = [];
        for(let roleIndex in rolePermissionMapping) {
            for (let j = 0; j < rolePermissionMapping[roleIndex].length; j++) {
                const permissionIndex = rolePermissionMapping[roleIndex][j];
                rolePermissions.push(rolePermissionRepository.create({
                    role_id: roles[roleIndex].id,
                    permission_id: permissions[permissionIndex].id
                }))
            }
        }

        await rolePermissionRepository.save(rolePermissions);

        //-------------------------------------------------


        const masterImageRepository = connection.getRepository(MasterImage);
        const masterImageNames : string[] = ['slim', 'buster', 'dl'];

        const masterImages: MasterImage[] = masterImageNames.map((name: string) => {
            return masterImageRepository.create({
                name: name,
                external_tag_id: name
            })
        });

        await masterImageRepository.save(masterImages);

        //-------------------------------------------------

        const realms : Partial<Realm>[] = [
            {id: 'station_1', name: 'Universität Leipzig'},
            {id: 'station_2', name: 'Universität Achen'},
            {id: 'station_3', name: 'Universität Tübingen'},
        ];
        const realmRepository = connection.getRepository(Realm);
        await realmRepository.insert(realms);

        //-------------------------------------------------

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
