import PermissionModel from "../../domains/permission/PermissionModel";
import {applyRequestFilter, onlyOneRow} from "../../db/helpers/queryHelper";
import {matchedData, validationResult} from "express-validator";
import PermissionResponseSchema from "../../domains/permission/PermissionResponseSchema";

const getPermissions = async (req: any, res: any) => {
    let { filter } = req.query;

    let query = PermissionModel()._findAll();

    applyRequestFilter(query,filter,['id','name']);

    let result = await query;

    let permissionResponseSchema = new PermissionResponseSchema();
    result = permissionResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
}

const getPermission = async (req: any, res: any) => {
    let id = req.params.id;
    let result;

    try {
        let query = PermissionModel()._find({id}).orWhere({name: id});
        result = await onlyOneRow(query);
    } catch (e) {
        return res._failNotFound();
    }

    let permissionResponseSchema = new PermissionResponseSchema();
    result = permissionResponseSchema.applySchemaOnEntity(result);

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
        await PermissionModel()._create(dbData);

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
        await PermissionModel()._drop(id);

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
