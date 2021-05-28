import {getCustomRepository, getRepository} from "typeorm";
import {UserRole} from "../../../../../domains/user/role";
import {UserRepository} from "../../../../../domains/user/repository";
import {applyRequestFilterOnQuery} from "../../../../../db/utils/filter";

//---------------------------------------------------------------------------------

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 * @param type
 */
export async function getRoleUsersRouteHandler(req: any, res: any, type: string) {
    let { roleId } = req.params;
    let { filter } = req.query;

    switch (type) {
        case 'self':
            try {
                const rolePermissionRepository = getRepository(UserRole);
                let query = await rolePermissionRepository.createQueryBuilder('userRole')
                    .where({
                        role_id: roleId
                    });

                applyRequestFilterOnQuery(query, filter, {
                    user_id: 'userRole.user_id',
                    id: 'userRole.id',
                    role_id: 'userRole.role_id'
                });

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                const permissionRepository = getCustomRepository(UserRepository);

                let query = permissionRepository.createQueryBuilder('user')
                    .leftJoin('user.userRoles','userRoles')
                    .where("userRoles.role_id = :roleId", {roleId});

                applyRequestFilterOnQuery(query, filter, {
                    id: 'user.id',
                    name: 'user.name'
                })

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                console.log(e);
                return res._failServerError();
            }
    }
}
