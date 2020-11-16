import {check, matchedData, validationResult} from "express-validator";
import {applyRequestFilter} from "../../db/helpers/queryHelper";
import LoggerService from "../../services/loggerService";
import RoleResponseSchema from "../../domains/role/RoleResponseSchema";
import RoleModel from "../../domains/role/RoleModel";
import RoleEntity from "../../domains/role/RoleEntity";

//---------------------------------------------------------------------------------

const getRoles = async (req: any, res: any) => {
    let { filter } = req.query;

    let query = RoleModel().findAll();

    applyRequestFilter(query,filter,['id','name']);

    let result = await query;

    let userResponseSchema = new RoleResponseSchema();

    result = userResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
};

const getRole = async (req: any, res: any) => {
    let { id } = req.params;

    try {
        let query = RoleModel().findOne({
            id
        });

        let result = await query;

        let responseSchema = new RoleResponseSchema();

        result = responseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
};

const addRole = async (req: any, res: any) => {
    if(!req.ability.can('add','role')) {
        return res._failForbidden();
    }

    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).optional().run(req);
    await check('keycloak_role_id').exists().notEmpty().isLength({min: 5, max: 100}).optional().run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    let ob: RoleEntity = {
        name: data.name,
        keycloak_role_id: data.keycloak_role_id
    };

    try {
        let result = await RoleModel().create(ob);

        LoggerService.info('role "' + data.name + '" created...');

        return res._respondCreated({
            data: {
                id: result[0]
            }
        });
    } catch (e) {
        return res._failValidationError();
    }
}

const editRole = async (req: any, res: any) => {
    let { id } = req.params;

    if(!req.ability.can('edit','role')) {
        return res._failForbidden();
    }

    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).optional().run(req);
    await check('keycloak_role_id').exists().notEmpty().isLength({min: 5, max: 100}).optional().run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(data) {
        let updateData: any = {};

        for(let key in data) {
            if(!data.hasOwnProperty(key)) {
                return;
            }

            switch (key) {
                case 'name':
                case 'keycloak_role_id':
                    updateData[key] = data[key];
                    break;
            }
        }

        if(updateData) {
            try {
                await RoleModel().update(updateData, id);
            } catch(e) {

            }

            return res._respondAccepted();
        }

        return res._failValidationError({message: 'Die Einstellungen konnten nicht aktualisiert werden.'});
    }

    return res._respond();
}

//---------------------------------------------------------------------------------

const dropRole = async (req: any, res: any) => {
    let {id} = req.params;

    if (!req.ability.can('drop', 'role')) {
        return res._failForbidden();
    }

    try {
        await RoleModel().drop(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }

}

//---------------------------------------------------------------------------------

export default {
    getRoles,
    getRole,
    addRole,
    editRole,
    dropRole
}
