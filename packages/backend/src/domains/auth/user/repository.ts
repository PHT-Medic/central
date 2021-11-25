/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityRepository, In, Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '@typescript-auth/server';
import { PermissionItem } from '@typescript-auth/core';

import { Role, User, UserRole } from '@personalhealthtrain/ui-common';
import { RoleRepository } from '../role/repository';

type PermissionOptions = {
    selfOwned?: boolean,
    roleOwned?: boolean
};

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async syncRoles(userId: number, roles: Role[]) {
        const userRoleRepository = this.manager.getRepository(UserRole);

        const userRoles = await userRoleRepository.createQueryBuilder('userRole')
            .where('userRole.user_id = :userId', { userId })
            .getMany();

        const userRoleIdsToDrop : number[] = userRoles
            .filter((userRole: UserRole) => roles.findIndex((item: Role) => item.id === userRole.role_id) === -1)
            .map((userRole: UserRole) => userRole.id);

        if (userRoleIdsToDrop.length > 0) {
            await userRoleRepository.delete({
                id: In(userRoleIdsToDrop),
            });
        }

        const userRolesToAdd : Partial<UserRole>[] = roles
            .filter((role: Role) => userRoles.findIndex((userRole: UserRole) => userRole.role_id === role.id) === -1)
            .map((role: Role) => ({
                role_id: role.id,
                user_id: userId,
            }));

        if (userRolesToAdd.length > 0) {
            await userRoleRepository.insert(userRolesToAdd);
        }
    }

    // ------------------------------------------------------------------

    async getOwnedPermissions(userId: string | number, options?: PermissionOptions) : Promise<PermissionItem<unknown>[]> {
        options = options ?? {};
        options.selfOwned = options.selfOwned ?? true;
        options.roleOwned = options.roleOwned ?? true;

        let permissions : PermissionItem<unknown>[] = [];

        if (options.selfOwned) {
            permissions = [...await this.getSelfOwnedPermissions(userId)];
        }

        if (options.roleOwned) {
            const entity = await this.manager
                .getCustomRepository<UserRepository>(UserRepository)
                .findOne(userId, { relations: ['user_roles'] });

            if (typeof entity === 'undefined') {
                return permissions;
            }

            const roleIds: number[] = entity.user_roles.map((userRole) => userRole.role_id);

            if (roleIds.length === 0) {
                return permissions;
            }

            const roleRepository = this.manager.getCustomRepository<RoleRepository>(RoleRepository);

            permissions = [...permissions, ...await roleRepository.getOwnedPermissions(roleIds)];
        }

        return permissions;
    }

    async getSelfOwnedPermissions(userId: string | number) : Promise<PermissionItem<unknown>[]> {
        return [];
    }

    // ------------------------------------------------------------------

    /**
     * Hash user password.
     *
     * @param password
     */
    async hashPassword(password: string) : Promise<string> {
        return hashPassword(password);
    }

    /**
     * Find a user by name and password.
     *
     * @param name
     * @param password
     */
    async verifyCredentials(name: string, password: string) : Promise<User | undefined> {
        let user : User | undefined;

        try {
            user = await this.createQueryBuilder('user')
                .addSelect('user.password')
                .where('user.name LIKE :name', { name })
                .getOne();

            if (typeof user === 'undefined') {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }

        if (!user.password) {
            return undefined;
        }

        const verified = await verifyPassword(password, user.password);
        if (!verified) {
            return undefined;
        }

        return user;
    }
}
