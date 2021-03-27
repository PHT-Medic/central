import {getRepository} from "typeorm";
import {UserRole} from "../../../../domains/user/role";
import {Role} from "../../../../domains/role";
import {check, matchedData, validationResult} from "express-validator";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";


export async function getUserRolesRouteHandler(req: any, res: any, type: string) {
    let { id } = req.params;
    let { filter } = req.query;

    switch (type) {
        case 'self':
            try {
                const repository = getRepository(UserRole);
                let query = await repository.createQueryBuilder('userRoles')
                    .leftJoinAndSelect('userRoles.role', 'role')
                    .where({
                        user_id: id
                    });

                applyRequestFilterOnQuery(query, filter, {
                    role_id: 'userRoles.role_id',
                    user_id: 'userRoles.user_id',
                    role_name: 'role.name'
                });

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                console.log(e);
                return res._failServerError();
            }
        case 'related':
            try {
                const repository = getRepository(Role);

                let query = repository.createQueryBuilder('role')
                    .leftJoinAndSelect('role.userRoles', 'userRoles')
                    .where("userRoles.user_id = :userId", {userId: id});

                applyRequestFilterOnQuery(query, filter, {
                    id: 'role.id',
                    name: 'role.name'
                })

                let items = await query.getMany();

                return res._respond({data: items});
            } catch (e) {
                console.log(e);
                return res._failServerError();
            }
    }
}

export async function getUserRoleRouteHandler(req: any, res: any, type: string) {
    let {id, relationId} = req.params;

    let repository;

    try {
        switch (type) {
            case 'self':
                repository = getRepository(UserRole);
                let entities = await repository.findOne({
                    role_id: relationId,
                    user_id: id
                })

                if (typeof entities === 'undefined') {
                    return res._failNotFound();
                }

                return res._respond({data: entities});
            case 'related':
                repository = getRepository(Role);

                let entity = repository.createQueryBuilder('role')
                    .leftJoinAndSelect('role.userRoles', 'userRoles')
                    .where("userRoles.user_id = :userId", {userId: id})
                    .where("userRoles.role_id = :roleId", {roleId: relationId})
                    .getOne();

                if (typeof entity === 'undefined') {
                    return res._failNotFound();
                }

                return res._respond({data: entity});
        }
    } catch (e) {
        return res._failServerError();
    }
}

export async function addUserRoleRouteHandler(req: any, res: any) {
    let { id } = req.params;

    id = parseInt(id, 10);

    if(typeof id !== "number" || Number.isNaN(id)) {
        return res._failBadRequest({message: 'Die User ID ist nicht gültig.'});
    }

    await check('role_id')
        .exists()
        .isInt()
        .run(req);

    if(!req.ability.can('add','userRole')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(UserRole);
    let entity = repository.create({
        role_id: data.role_id,
        user_id: id
    });

    try {
        entity = await repository.save(entity);

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropUserRoleRouteHandler(req: any, res: any, type: 'self' | 'related') {
    let { id, relationId } = req.params;

    if(!req.ability.can('drop','userRole')) {
        return res._failForbidden();
    }

    const repository = getRepository(UserRole);

    let entity : UserRole | undefined;

    switch (type) {
        case "self":
            entity = await repository.findOne(relationId);
            break;
        case "related":
            entity = await repository.findOne({
                role_id: relationId,
                user_id: id
            })
            break;
    }

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
