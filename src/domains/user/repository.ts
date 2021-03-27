import {Repository, EntityRepository, getCustomRepository, getRepository, In} from "typeorm";
import {User} from "./index";
import {hashPassword, verifyPassword} from "../../modules/auth/utils/password";
import {RoleRepository} from "../role/repository";
import {PermissionInterface} from "../../modules/auth";
import {Role} from "../role";
import {UserRole} from "./role";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async syncRoles(userId: number, roles: Role[]) {
        const userRoleRepository = getRepository(UserRole);

        let userRoles = await userRoleRepository.createQueryBuilder('userRole')
            .where("userRole.user_id = :userId", {userId})
            .getMany();

        const userRoleIdsToDrop : number[] = userRoles
            .filter((userRole: UserRole) => roles.findIndex((item: Role) => item.id === userRole.role_id) === -1)
            .map((userRole: UserRole) => userRole.id);

        if(userRoleIdsToDrop.length > 0) {
            await userRoleRepository.delete({
                id: In(userRoleIdsToDrop)
            });
        }

        const userRolesToAdd : Partial<UserRole>[] = roles
            .filter((role: Role) => userRoles.findIndex((userRole: UserRole) => userRole.role_id === role.id) === -1)
            .map((role: Role) => {
                return {
                    role_id: role.id,
                    user_id: userId
                }
            });

        if(userRolesToAdd.length > 0) {
            await userRoleRepository.insert(userRolesToAdd);
        }
    }
    /**
     * Get User permissions.
     *
     * @param userId
     */
    async findPermissions(userId: number) : Promise<PermissionInterface[]> {
        const user = await this.findOne(userId, {relations: ['userRoles']});
        if(typeof user === 'undefined') {
            return [];
        }

        const roleIds : number[] = user.userRoles.map((item) => {
            return item.role_id;
        });

        if(roleIds.length > 0) {
            return await getCustomRepository<RoleRepository>(RoleRepository).getPermissions(roleIds);
        }

        return [];
    }

    /**
     * Hash user password.
     *
     * @param password
     */
    async hashPassword(password: string) : Promise<string> {
        return await hashPassword(password);
    }

    /**
     * Find a user by name and password.
     *
     * @param name
     * @param password
     */
    async findByCredentials(name: string, password: string) : Promise<User|undefined> {
        let user : User | undefined;

        try {
            user = await this.createQueryBuilder('user')
                .addSelect('user.password')
                .where("user.name LIKE :name", {name: name})
                .getOne();

            if(typeof user === 'undefined') {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }

        if(!user.password) {
            return undefined;
        }

        const verified = await verifyPassword(password, user.password);
        if(!verified) {
            return undefined;
        }

        return user;
    }
}
