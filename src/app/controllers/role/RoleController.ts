import {check, matchedData, validationResult} from "express-validator";
import RoleResponseSchema from "../../../domains/role/RoleResponseSchema";
import {getRepository} from "typeorm";
import {Role} from "../../../domains/role";
import {applyRequestFilterOnQuery} from "../../../db/utils";

//---------------------------------------------------------------------------------

const getRoles = async (req: any, res: any) => {
    let { filter } = req.query;

    const roleRepository = getRepository(Role);
    const queryBuilder = roleRepository.createQueryBuilder('role');

    applyRequestFilterOnQuery(queryBuilder, filter, ['id', 'name']);

    let result = await queryBuilder.getMany();

    let userResponseSchema = new RoleResponseSchema();

    result = userResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
};

const getRole = async (req: any, res: any) => {
    let { id } = req.params;

    try {
        const roleRepository = getRepository(Role);
        let result = await roleRepository.findOne(id);

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

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

    await check('name').exists().notEmpty().isLength({min: 3, max: 30}).run(req);
    await check('provider_role_id').exists().notEmpty().isLength({min: 3, max: 100}).optional({
        nullable: true
    }).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const roleRepository = getRepository(Role);
    let role = roleRepository.create(data);

    try {
        await roleRepository.save(role);

        return res._respondCreated({
            data: {
                id: role.id
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

    await check('name').exists().notEmpty().isLength({min: 3, max: 30}).optional().run(req);
    await check('provider_role_id').exists().notEmpty().isLength({min: 3, max: 100}).optional({
        nullable: true
    }).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: true});
    if(!data) {
        return res._respondAccepted();
    }

    console.log(data);

    const roleRepository = getRepository(Role);
    let role = await roleRepository.findOne(id);

    if(typeof role === 'undefined') {
        return res._failValidationError({message: 'Die Rolle konnte nicht gefunden werden.'});
    }

    role = roleRepository.merge(role, data);

    try {
        const result = await roleRepository.save(role);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'Die Einstellungen konnten nicht aktualisiert werden.'});
    }
}

//---------------------------------------------------------------------------------

const dropRole = async (req: any, res: any) => {
    let {id} = req.params;

    if (!req.ability.can('drop', 'role')) {
        return res._failForbidden();
    }

    try {
        const roleRepository = getRepository(Role);
        await roleRepository.delete(id);

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
