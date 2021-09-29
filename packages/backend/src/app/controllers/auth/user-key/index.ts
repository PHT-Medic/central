import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {SwaggerTags} from "typescript-swagger";
import {
    removeUserPublicKeyFromVault,
    saveUserPublicKeyToVault,
    UserKeyRing
} from "@personalhealthtrain/ui-common";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

@SwaggerTags('user', 'pht')
@Controller("/user-key-rings")
export class UserKeyController {
    @Get("", [ForceLoggedInMiddleware])
    async get(
        @Request() req: any,
        @Response() res: any
    ) : Promise<UserKeyRing> {
        return getUserKeyRouteHandler(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>,
    ) : Promise<UserKeyRing> {
        return addUserKeyRouteHandler(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>
    ) : Promise<UserKeyRing> {
        return editUserKeyRouteHandler(req, res);
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<UserKeyRing> {
        return dropUserKeyRouteHandler(req, res);
    }
}

export async function getUserKeyRouteHandler(req: any, res: any) {
    const repository = getRepository(UserKeyRing);

    const entity = await repository.findOne({
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

async function runValidationRules(req: any) {
    await check('public_key').optional({nullable: true}).isLength({min: 5, max: 4096}).run(req);
    await check('he_key').optional({nullable: true}).isLength({min: 5, max: 4096}).run(req);
}

export async function addUserKeyRouteHandler(req: any, res: any) {
    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    try {
        const repository = getRepository(UserKeyRing);

        const entity = repository.create({
            user_id: req.user.id,
            ...data
        });

        await repository.save(entity);

        await saveUserPublicKeyToVault(entity);

        return res._respond({data: entity});
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'The key ring could not be created...'})
    }
}

export async function editUserKeyRouteHandler(req: any, res: any) {
    const { id } = req.params;

    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(UserKeyRing);

    let entity = await repository.findOne({
        id,
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    entity = repository.merge(entity,data);

    try {
        await saveUserPublicKeyToVault(entity);

        await repository.save(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'The key ring could not be updated...'})
    }
}

export async function dropUserKeyRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(UserKeyRing);

    const entity = await repository.findOne({
        id,
        user_id: req.user.id
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {
        await removeUserPublicKeyFromVault(entity);

        await repository.remove(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'The key ring could not be deleted...'})
    }
}
