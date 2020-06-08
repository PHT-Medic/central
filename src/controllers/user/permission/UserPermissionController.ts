import AuthUserPermissionModel from "../../../domains/auth/user/permission/AuthUserPermissionModel";
import {applyRequestFilter} from "../../../db/helpers/queryHelper";
import {matchedData, validationResult} from "express-validator";
import LoggerService from "../../../services/loggerService";
import {cat} from "shelljs";

//---------------------------------------------------------------------------------

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 */
const getUserPermissions = async (req: any, res: any) => {
    let { userId } = req.params;
    let { filter } = req.query;

    if(userId === 'me') {
        userId = req.user.id;
    }

    let permissions = await AuthUserPermissionModel().getPermissions(userId, (query: Promise<any>) => {
        applyRequestFilter(query,filter,['id','name']);
    });

    return res._respond({data: permissions});
};

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
        await AuthUserPermissionModel()._create(ob);
    } catch (e) {
        return res._failValidationError();
    }

    return res._respondCreated();
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

    try {
        await AuthUserPermissionModel()._dropWhere({
            user_id: userId,
            permission_id: permissionId
        });

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

export default {
    getUserPermissions,
    addUserPermission,
    dropUserPermission
};

export {
    getUserPermissions,
    addUserPermission,
    dropUserPermission
}
