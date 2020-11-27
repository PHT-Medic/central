import {Factory, Seeder} from "typeorm-seeding";
import {Connection, getRepository} from "typeorm";
import {UserRepository} from "../../domains/user/repository";
import {RoleRepository} from "../../domains/role/repository";
import {Permission} from "../../domains/permission";
import {RolePermission} from "../../domains/role/permission";
import {Realm} from "../../domains/realm";
import {Provider, AuthenticatorScheme} from "../../domains/provider";
import {UserRole} from "../../domains/user/role";

export default class CreateBase implements Seeder {
    public async run(factory: Factory, connection: Connection) : Promise<any> {
        const realmRepository = connection.getRepository(Realm);

        let masterRealm = realmRepository.create({
            id: "master",
            name: "Master",
            drop_able: false
        });

        await realmRepository.save(masterRealm);

        //-------------------------------------------------

        const authenticatorRepository = connection.getRepository(Provider);

        let authenticator = authenticatorRepository.create({
            name: 'master-keycloak',
            scheme: AuthenticatorScheme.OPENID,
            token_host: 'https://keycloak.personalhealthtrain.de/auth/realms/master/',
            token_path: 'protocol/openid-connect/token',
            authorize_path: 'protocol/openid-connect/auth',
            client_id: 'pht',
            client_secret: '7fb6c3dd-8322-443d-956c-e1e8a73b0381',
            realm: masterRealm
        });

        await authenticatorRepository.save(authenticator);

        //-------------------------------------------------

        const roleRepository = connection.getCustomRepository(RoleRepository);

        let adminRole = roleRepository.create({
            name: 'admin'
        });

        await roleRepository.save(adminRole);

        //-------------------------------------------------

        const userRepository = connection.getCustomRepository(UserRepository);

        let adminUser = userRepository.create({
            name: 'admin',
            password: await userRepository.hashPassword('start123'),
            email: 'peter.placzek1996@gmail.com',
            realm: masterRealm
        });

        await userRepository.save(adminUser);

        //-------------------------------------------------

        const userRoleRepository = getRepository(UserRole);

        await userRoleRepository.insert({
            role_id: adminRole.id,
            user_id: adminUser.id
        });

        //-------------------------------------------------

        const permissionRepository = connection.getRepository(Permission);
        const names : string[] = [
            'admin_ui_use',

            'realm_add',
            'realm_drop',
            'realm_edit',

            'provider_add',
            'provider_drop',
            'provider_edit',

            'permission_add',
            'permission_drop',
            'permission_edit',

            'user_add',
            'user_drop',
            'user_edit',

            'user_role_add',
            'user_role_drop',
            'user_role_edit',

            'role_add',
            'role_drop',
            'role_edit',

            'role_permission_add',
            'role_permission_drop'
        ];
        const permissions : Permission[] = names.map((name: string) => {
            return permissionRepository.create({name});
        });

        await permissionRepository.save(permissions);

        //-------------------------------------------------

        const rolePermissionRepository = connection.getRepository(RolePermission);
        let rolePermissions : RolePermission[] = [];
        for(let j=0; j<permissions.length; j++) {
            rolePermissions.push(rolePermissionRepository.create({
                role_id: adminRole.id,
                permission_id: permissions[j].id
            }))
        }

        await rolePermissionRepository.save(rolePermissions);
    }
}
