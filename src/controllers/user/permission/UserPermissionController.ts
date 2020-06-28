import UserPermissionModel, {findUserPermissionCallback} from "../../../domains/user/permission/UserPermissionModel";
import {applyRequestFilter, onlyOneRow} from "../../../db/helpers/queryHelper";
import {matchedData, validationResult} from "express-validator";
import LoggerService from "../../../services/loggerService";
import {cat} from "shelljs";
import UserPermissionResponseSchema from "../../../domains/user/permission/UserPermissionResponseSchema";
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
const getUserPermissions = async (req: any, res: any, type: string, asAbility: boolean) => {
    let { userId } = req.params;
    let { filter } = req.query;

    if(userId === 'me') {
        userId = req.user.id;
    }

    let permissionTable = PermissionModel()._getTable();
    let userPermissionTable = UserPermissionModel()._getTable();
    let whereObject: any = {};

    switch (type) {
        case 'self':
            try {
                let query = UserPermissionModel()._findAll();
                query.select(userPermissionTable+'.*');
                query.join(permissionTable,permissionTable+'.id', userPermissionTable+'.permission_id');

                whereObject[userPermissionTable+'.user_id'] = userId;
                query.where(whereObject);

                applyRequestFilter(query, filter, {
                    user_id: userPermissionTable+'.user_id',
                    permission_id: permissionTable+'.id',
                    name: permissionTable+'.name'
                });

                let items = await query;

                let responseSchema = new UserPermissionResponseSchema();
                items = responseSchema.applySchemaOnEntities(items);

                return res._respond({data: items});
            } catch (e) {
                return res._failServerError();
            }
        case 'related':
            try {
                let query = PermissionModel()._findAll();

                query.select(permissionTable+'.*');
                query.leftJoin(userPermissionTable,userPermissionTable+'.permission_id',permissionTable+'.id');

                applyRequestFilter(query, filter, {
                    id: permissionTable+'.id',
                    name: permissionTable+'.name',
                    permission_id: permissionTable+'.id',
                });

                whereObject[userPermissionTable+'.user_id'] = userId;

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
const getUserPermission = async (req: any, res: any, type: string, asAbility: boolean) => {
    let {userId, permissionId} = req.params;

    if (userId === 'me') {
        userId = req.user.id;
    }

    let permissionTable = PermissionModel()._getTable();
    let userPermissionTable = UserPermissionModel()._getTable();

    switch (type) {
        case 'self':
            try {
                let query = UserPermissionModel()._findOne({
                    id: permissionId,
                    user_id: userId
                });

                let item = await query;

                let responseSchema = new UserPermissionResponseSchema();
                item = responseSchema.applySchemaOnEntity(item);

                return res._respond({data: item});
            } catch (e) {
                return res._failNotFound();
            }
        case 'related':
            try {
                let query = PermissionModel()._findOne();

                query.select(permissionTable+'.*');
                query.leftJoin(userPermissionTable,userPermissionTable+'.permission_id',permissionTable+'.id');

                let whereObject: any = {};
                whereObject[userPermissionTable+'.user_id'] = userId;
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
const addUserPermission = async (req: any, res: any) => {
    let { userId } = req.params;

    if(!req.ability.can('add','user_permission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidation({validation});
    }

    const data = matchedData(req, {includeOptionals: false});

    let ob: object = {
        permission_id: data.permission_id,
        user_id: userId
    };

    try {
        let result = await UserPermissionModel()._create(ob);

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
const dropUserPermission = async (req: any, res: any) => {
    let { userId, permissionId } = req.params;

    if(!req.ability.can('drop','user_permission')) {
        return res._failForbidden();
    }

    if(parseInt(userId) === req.user.id) {
        return res._failForbidden({
            message: 'Die eigenen Berechtigungen können nicht gelöscht werden.'
        });
    }

    try {
        await UserPermissionModel()._dropWhere({
            id: permissionId
        });

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

export default {
    getUserPermissions,
    getUserPermission,
    addUserPermission,
    dropUserPermission
};

export {
    getUserPermissions,
    getUserPermission,
    addUserPermission,
    dropUserPermission
}
