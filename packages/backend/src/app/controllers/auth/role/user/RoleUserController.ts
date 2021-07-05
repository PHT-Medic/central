import {getCustomRepository, getRepository} from "typeorm";
import {applyRequestFilter} from "typeorm-extension";
import {UserRole} from "../../../../../domains/user/role";
import {UserRepository} from "../../../../../domains/user/repository";

// ---------------------------------------------------------------------------------

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 * @param type
 */
export async function getRoleUsersRouteHandler(req: any, res: any, type: string) {
    const { roleId } = req.params;
    const { filter } = req.query;

    switch (type) {
        case 'self':
            try {
                const rolePermissionRepository = getRepository(UserRole);
                const query = await rolePermissionRepository.createQueryBuilder('userRole')
                    .where({
                        role_id: roleId
                    });

                applyRequestFilter(query, filter, {
                    user_id: 'userRole.user_id',
                    id: 'userRole.id',
                    role_id: 'userRole.role_id'
                });

                const items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                const permissionRepository = getCustomRepository(UserRepository);

                const query = permissionRepository.createQueryBuilder('user')
                    .leftJoin('user.user_roles','user_roles')
                    .where("user_roles.role_id = :roleId", {roleId});

                applyRequestFilter(query, filter, {
                    id: 'user.id',
                    name: 'user.name'
                })

                const items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                console.log(e);
                return res._failServerError();
            }
    }
}
