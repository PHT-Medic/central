import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {applyRequestPagination, applyRequestFilter} from "typeorm-extension";
import {Role} from "../../../../domains/auth/role";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

// ---------------------------------------------------------------------------------

type PartialRole = Partial<Role>;
const simpleExample = {name: 'admin'};

@SwaggerTags('auth')
@Controller("/roles")
export class RoleController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialRole[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialRole[]> {
        return await getRoles(req, res) as PartialRole[];
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async add(
        @Body() data: Pick<Role, 'name'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialRole> {
        return await addRole(req, res) as PartialRole;
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialRole> {
        return await getRole(req, res) as PartialRole;
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: Pick<Role, 'name'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialRole> {
        return await editRole(req, res) as PartialRole;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialRole> {
        return await dropRole(req, res) as PartialRole;
    }
}

async function getRoles(req: any, res: any) {
    const { filter, page } = req.query;

    const roleRepository = getRepository(Role);
    const query = roleRepository.createQueryBuilder('role');

    applyRequestFilter(query, filter, ['id', 'name']);

    const pagination = applyRequestPagination(query, page, 50);

    const [entities, total] = await query.getManyAndCount();

    return res._respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

async function getRole(req: any, res: any) {
    const { id } = req.params;

    try {
        const roleRepository = getRepository(Role);
        const result = await roleRepository.findOne(id);

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
}

async function addRole(req: any, res: any) {
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
    const role = roleRepository.create(data);

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

async function editRole(req: any, res: any) {
    const { id } = req.params;

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

// ---------------------------------------------------------------------------------

async function dropRole(req: any, res: any) {
    const {id} = req.params;

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
