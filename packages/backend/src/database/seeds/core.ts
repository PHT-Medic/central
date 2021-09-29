import {Connection} from "typeorm";
import {Seeder, Factory} from 'typeorm-seeding';

import {getPermissions} from "../../config/permissions";

import {UserRepository} from "../../domains/auth/user/repository";
import {MASTER_REALM_ID, Permission, Realm, RolePermission, UserRole} from "@personalhealthtrain/ui-common";
import {RoleRepository} from "../../domains/auth/role/repository";

export default class CreateCore implements Seeder {
    public async run(factory: Factory, connection: Connection) : Promise<any> {
        /**
         * Create default realm
         */
        const realmRepository = connection.getRepository(Realm);

        const masterRealm = realmRepository.create({
            id: MASTER_REALM_ID,
            name: "Master",
            drop_able: false
        });

        await realmRepository.save(masterRealm);

        // -------------------------------------------------

        /**
         * Create default role
         */
        const repository = connection.getCustomRepository(RoleRepository);

        const adminRole = repository.create({
            name: 'admin'
        });

        await repository.save(adminRole);

        // -------------------------------------------------

        /**
         * Create default user
         */
        const userRepository = connection.getCustomRepository(UserRepository);
        const adminUser = userRepository.create({
            name: 'admin',
            password: await userRepository.hashPassword('start123'),
            email: 'peter.placzek1996@gmail.com',
            realm: masterRealm
        });

        await userRepository.save(adminUser);

        // -------------------------------------------------

        /**
         * Create default user - role association
         */
        const userRoleRepository = connection.getRepository(UserRole);
        await userRoleRepository.insert({
            role_id: adminRole.id,
            user_id: adminUser.id
        });

        // -------------------------------------------------

        /**
         * Create all permissions
         */
        const permissionRepository = connection.getRepository(Permission);
        const ids : string[] = getPermissions();
        const permissions : Permission[] = ids.map((id: string) => {
            return permissionRepository.create({id});
        });

        await permissionRepository.save(permissions);

        // -------------------------------------------------

        /**
         * Assign all permissions to default role.
         */
        const rolePermissionRepository = connection.getRepository(RolePermission);
        const rolePermissions : RolePermission[] = [];
        for(let j=0; j<permissions.length; j++) {
            rolePermissions.push(rolePermissionRepository.create({
                role_id: adminRole.id,
                permission_id: permissions[j].id
            }))
        }

        await rolePermissionRepository.save(rolePermissions);
    }
}
