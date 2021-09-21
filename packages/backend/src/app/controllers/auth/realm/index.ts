import {getRepository} from "typeorm";
import {applyRequestFilter, applyRequestPagination} from "typeorm-extension";
import {check, matchedData, validationResult} from "express-validator";
import {SwaggerTags} from "typescript-swagger";
import {Controller, Get, Post, Delete, Request, Response, Params, Body} from "@decorators/express";

import {Realm} from "../../../../domains/auth/realm";
import {OAuth2Provider} from "../../../../domains/auth/oauth2-provider";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

@SwaggerTags('auth')
@Controller("/realms")
export class RealmController {
    @Get("", [])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<Realm[]> {
        return await getRealmsRoute(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async add(
        @Body() user: NonNullable<OAuth2Provider>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Realm> {
        return await addRealmRoute(req, res);
    }

    @Get("/:id", [])
    async get(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Realm> {
        return await getRealmRoute(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
        @Body() user: NonNullable<Realm>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Realm> {
        return await editRealmRoute(req, res);
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Realm> {
        return await dropRealmRoute(req, res);
    }
}

export async function getRealmsRoute(req: any, res: any) {
    const {filter, page} = req.query;
    const realmRepository = getRepository(Realm);

    const query = realmRepository.createQueryBuilder('realm');

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

export async function getRealmRoute(req: any, res: any) {
    const { id } = req.params;

    if(typeof id !== 'string') {
        return res._failBadRequest();
    }

    const realmRepository = getRepository(Realm);

    const result = await realmRepository.findOne(id);

    if(typeof result === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({
        data: result
    })
}

// ---------------------------------------------------------------------------------

async function runValidation(req: any) {
    await check('id').exists().notEmpty().isString().isLength({min: 5, max: 36}).run(req);
    await check('name').exists().notEmpty().isString().isLength({min: 5, max: 100}).run(req);
    await check('description').exists().notEmpty().isString().isLength({min: 5, max: 100}).optional().run(req);
}

// ---------------------------------------------------------------------------------

export async function addRealmRoute(req: any, res: any) {
    if(!req.ability.can('add','realm')) {
        return res._failForbidden({message: 'You are not allowed to add a realm.'});
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const realmRepository = getRepository(Realm);

    const realm = realmRepository.create(data);

    try {
        await realmRepository.save(realm);

        return res._respond({
            data: realm
        })
    } catch (e) {
        return res._failValidationError({message: 'Der Realm konnte nicht erstellt werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function editRealmRoute(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('edit','realm')) {
        return res._failForbidden({message: 'You are not allowed to edit a realm.'});
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const realmRepository = getRepository(Realm);

    let realm = await realmRepository.findOne(id);
    if(typeof realm === 'undefined') {
        return res._failNotFound();
    }

    realm = realmRepository.merge(realm, data);

    try {
        await realmRepository.save(realm);

        return res._respond({
            data: realm
        })
    } catch (e) {
        return res._failValidationError({message: 'Der Realm konnte nicht bearbeitet werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function dropRealmRoute(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.can('drop', 'realm')) {
        return res._failForbidden({message: 'You are not allowed to drop a realm.'});
    }

    const repository = getRepository(Realm);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!entity.drop_able) {
        return res._failForbidden({message: 'The realm can not be deleted in general.'})
    }

    try {

        await repository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }
}
