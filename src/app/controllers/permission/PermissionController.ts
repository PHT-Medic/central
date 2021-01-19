import {matchedData, validationResult} from "express-validator";
import PermissionResponseSchema from "../../../domains/permission/PermissionResponseSchema";
import {getRepository} from "typeorm";
import {Permission} from "../../../domains/permission";
import {applyRequestFilterOnQuery} from "../../../db/utils";

const getPermissions = async (req: any, res: any) => {
    let { filter } = req.query;

    const repository = getRepository(Permission);
    const queryBuilder = repository.createQueryBuilder('user');

    applyRequestFilterOnQuery(queryBuilder, filter, ['id', 'name']);

    let result = await queryBuilder.getMany();

    let permissionResponseSchema = new PermissionResponseSchema();
    result = permissionResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
}

const getPermission = async (req: any, res: any) => {
    let id = req.params.id;
    let result;

    try {
        const repository = getRepository(Permission);
        let result = await repository.createQueryBuilder('permission')
            .where("id = :id", {id})
            .orWhere("name Like :name", {name: id})
            .getOne();

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        let permissionResponseSchema = new PermissionResponseSchema();
        result = permissionResponseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});

    } catch (e) {
        return res._failNotFound();
    }
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

    const repository = getRepository(Permission);
    let permission = repository.create({
        name: data.name
    })

    try {
        await repository.save(permission);

        return res._respondCreated({
            data: permission
        });
    } catch (e) {
        return res._failValidationError();
    }
};

const dropPermission = async (req: any, res: any) => {
    let { id } = req.params;

    if(!req.ability.can('drop','permission')) {
        return res._failForbidden();
    }

    try {
        const repository = getRepository(Permission);
        await repository.delete(id);

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
