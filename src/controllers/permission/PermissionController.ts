import AuthPermissionModel from "../../domains/auth/permission/AuthPermissionModel";
import {applyRequestFilter, onlyOneRow} from "../../db/helpers/queryHelper";
import {matchedData, validationResult} from "express-validator";

const getPermissions = async (req: any, res: any) => {
    let { filter } = req.query;

    let query = AuthPermissionModel()._findAll();

    applyRequestFilter(query,filter,['id','name']);

    let result = await query;

    return res._respond({data: result});
}

const getPermission = async (req: any, res: any) => {
    let id = req.params.id;
    let result;

    try {
        let query = AuthPermissionModel()._find({id});
        result = await onlyOneRow(query);
    } catch (e) {
        return res._failNotFound();
    }

    return res._respond({data: result});
}

const addPermission = async (req: any, res: any) => {
    if(!req.ability.can('add','permission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidation({validation});
    }

    const data = matchedData(req, {includeOptionals: false});

    let dbData = {
        name: data.name
    };

    try {
        await AuthPermissionModel()._create(dbData);

        return res._respondCreated();
    } catch (e) {
        console.log(e.message);
        return res._failValidationError();
    }
};

const dropPermission = async (req: any, res: any) => {
    let { id } = req.params;

    if(!req.ability.can('drop','permission')) {
        return res._failForbidden();
    }

    try {
        await AuthPermissionModel()._drop(id);

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

const editPermission = async (req: any, res: any) => {
    //todo: implement
}

export default {
    getPermissions,
    getPermission,
    addPermission,
    dropPermission,
    editPermission
}
