import {EntityRepository, getCustomRepository, Repository} from "typeorm";
import {User} from "./index";
import {hashPassword, verifyPassword} from "../../services/auth/helpers/authHelper";
import {RoleRepository} from "../role/repository";
import {PermissionInterface} from "../../services/auth";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    /**
     * Get User permissions.
     *
     * @param userId
     */
    async findPermissions(userId: number) : Promise<PermissionInterface[]> {
        const user = await this.findOne(userId, {relations: ['roles']});
        if(typeof user === 'undefined') {
            return [];
        }

        const roleIds : number[] = user.roles.map((item) => {
            return item.id;
        });

        return await getCustomRepository<RoleRepository>(RoleRepository).getPermissions(roleIds);
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
                .where("user.name LIKE '%:name%", {name: name})
                .getOne();

            if(typeof user === 'undefined') {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }

        const verified = await verifyPassword(password, user.password);
        if(!verified) {
            return undefined;
        }

        return user;
    }
}
