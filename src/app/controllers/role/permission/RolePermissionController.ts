import {check, matchedData, validationResult} from "express-validator";
import RolePermissionResponseSchema from "../../../../domains/role/permission/RolePermissionResponseSchema";
import PermissionResponseSchema from "../../../../domains/permission/PermissionResponseSchema";
import {getRepository} from "typeorm";
import {RolePermission} from "../../../../domains/role/permission";
import {Permission} from "../../../../domains/permission";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";

//---------------------------------------------------------------------------------

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 * @param type
 * @param asAbility
 */
const getRolePermissions = async (req: any, res: any, type: string, asAbility: boolean) => {
    let { roleId } = req.params;
    let { filter } = req.query;

    switch (type) {
        case 'self':
            try {
                const rolePermissionRepository = getRepository(RolePermission);
                let query = await rolePermissionRepository.createQueryBuilder('rolePermission')
                    .leftJoinAndSelect('rolePermission.permission', 'permission')
                    .where({
                        role_id: roleId
                    });

                applyRequestFilterOnQuery(query, filter, {
                    role_id: 'permission.role_id',
                    permission_id: 'permission.id',
                    name: 'permission.name'
                });

                let items = await query.getMany();

                let responseSchema = new RolePermissionResponseSchema();
                items = responseSchema.applySchemaOnEntities(items);

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                const permissionRepository = getRepository(Permission);

                let query = permissionRepository.createQueryBuilder('permission')
                    .leftJoinAndSelect('permission.rolePermissions', 'rolePermissions')
                    .where("rolePermissions.role_id = :roleId", {roleId});

                applyRequestFilterOnQuery(query, filter, {
                    id: 'permission.id',
                    name: 'permission.name',
                    permission_id: 'permission.id',
                })

                let items = await query.getMany();

                let responseSchema = new PermissionResponseSchema();
                items = responseSchema.applySchemaOnEntities(items);

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
    }
};

//---------------------------------------------------------------------------------

/**
 * Receive a specific permission of a specific user.
 *
 * @param req
 * @param res
 * @param type
 * @param asAbility
 */
const getRolePermission = async (req: any, res: any, type: string, asAbility: boolean) => {
    let {roleId, permissionId} = req.params;

    switch (type) {
        case 'self':
            try {
                const rolePermissionRepository = getRepository(RolePermission);
                let rolePermission = await rolePermissionRepository.findOne({
                    role_id: roleId,
                    permission_id: permissionId
                })

                let responseSchema = new RolePermissionResponseSchema();
                rolePermission = responseSchema.applySchemaOnEntity(rolePermission);

                return res._respond({data: rolePermission});
            } catch (e) {
                return res._failNotFound();
            }
        case 'related':
            try {
                const permissionRepository = getRepository(Permission);

                let permission = permissionRepository.createQueryBuilder('permission')
                    .leftJoinAndSelect('permission.rolePermissions', 'rolePermissions')
                    .where("rolePermissions.role_id = :roleId", {roleId})
                    .where("rolePermissions.permission_id = :permissionId", {permissionId})
                    .getOne();

                let responseSchema = new PermissionResponseSchema();
                permission = responseSchema.applySchemaOnEntity(permission);

                return res._respond({data: permission});
            } catch (e) {
                return res._failNotFound();
            }
    }
}

//---------------------------------------------------------------------------------

/**
 * Add an permission by id to a specific user.
 *
 * @param req
 * @param res
 */
const addRolePermission = async (req: any, res: any) => {
    let { roleId } = req.params;

    roleId = parseInt(roleId);

    if(typeof roleId !== "number") {
        return res._failBadRequest({message: 'Die Rollen ID ist nicht gültig.'});
    }

    await check('permission_id')
        .exists()
        .isInt().run(req);

    if(!req.ability.can('add','rolePermission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(RolePermission);
    let rolePermission = repository.create({
        permission_id: data.permission_id,
        role_id: roleId
    });

    try {
        rolePermission = await repository.save(rolePermission);

        return res._respondCreated({
            data: rolePermission
        });
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

/**
 * Drop an permission by id of a specific user.
 *
 * @param req
 * @param res
 */
const dropRolePermission = async (req: any, res: any) => {
    let { permissionId } = req.params;

    if(!req.ability.can('drop','rolePermission')) {
        return res._failForbidden();
    }

    try {
        const repository = getRepository(RolePermission);
        await repository.delete(permissionId);

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

export default {
    getRolePermissions,
    getRolePermission,
    addRolePermission,
    dropRolePermission
};

export {
    getRolePermissions,
    getRolePermission,
    addRolePermission,
    dropRolePermission
}
