import RolePermissionModel from "../../../domains/role/permission/RolePermissionModel";
import {applyRequestFilter, onlyOneRow} from "../../../db/helpers/queryHelper";
import {check, matchedData, validationResult} from "express-validator";
import RolePermissionResponseSchema from "../../../domains/role/permission/RolePermissionResponseSchema";
import PermissionModel from "../../../domains/permission/PermissionModel";
import PermissionResponseSchema from "../../../domains/permission/PermissionResponseSchema";

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

    let permissionTable = PermissionModel().getTable();
    let rolePermissionTable = RolePermissionModel().getTable();
    let whereObject: any = {};

    switch (type) {
        case 'self':
            try {
                let query = RolePermissionModel().findAll();
                query.select(rolePermissionTable+'.*');
                query.join(permissionTable,permissionTable+'.id', rolePermissionTable+'.permission_id');

                whereObject[rolePermissionTable+'.role_id'] = roleId;
                query.where(whereObject);

                applyRequestFilter(query, filter, {
                    role_id: rolePermissionTable+'.role_id',
                    permission_id: permissionTable+'.id',
                    name: permissionTable+'.name'
                });

                let items = await query;

                let responseSchema = new RolePermissionResponseSchema();
                items = responseSchema.applySchemaOnEntities(items);

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                let query = PermissionModel().findAll();

                query.select(permissionTable+'.*');
                query.leftJoin(rolePermissionTable,rolePermissionTable+'.permission_id',permissionTable+'.id');

                applyRequestFilter(query, filter, {
                    id: permissionTable+'.id',
                    name: permissionTable+'.name',
                    permission_id: permissionTable+'.id',
                });

                whereObject[rolePermissionTable+'.role_id'] = roleId;

                let items = await query;

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

    let permissionTable = PermissionModel().getTable();
    let userPermissionTable = RolePermissionModel().getTable();

    switch (type) {
        case 'self':
            try {
                let query = RolePermissionModel().findOne({
                    id: permissionId,
                    role_id: roleId
                });

                let item = await query;

                let responseSchema = new RolePermissionResponseSchema();
                item = responseSchema.applySchemaOnEntity(item);

                return res._respond({data: item});
            } catch (e) {
                return res._failNotFound();
            }
        case 'related':
            try {
                let query = PermissionModel().findOne();

                query.select(permissionTable+'.*');
                query.leftJoin(userPermissionTable,userPermissionTable+'.permission_id',permissionTable+'.id');

                let whereObject: any = {};
                whereObject[userPermissionTable+'.role_id'] = roleId;
                whereObject[userPermissionTable+'.permission_id'] = permissionId;

                let permission = await onlyOneRow(query);

                let responseSchema = new PermissionResponseSchema();
                permission = responseSchema.applySchemaOnEntity(permission);

                return res._respond({data: permission});
            } catch (e) {
                console.log(e);
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

    await check('permission_id')
        .exists()
        .isInt().run(req);

    if(!req.ability.can('add','role_permission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    let ob: object = {
        permission_id: data.permission_id,
        role_id: roleId
    };

    try {
        let result = await RolePermissionModel().create(ob);

        return res._respondCreated({
            data: {
                id: result[0]
            }
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

    if(!req.ability.can('drop','role_permission')) {
        return res._failForbidden();
    }

    try {
        await RolePermissionModel().dropWhere({
            id: permissionId
        });

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
