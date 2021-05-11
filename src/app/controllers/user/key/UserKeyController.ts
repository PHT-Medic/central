import {getRepository} from "typeorm";
import {UserKeyRing} from "../../../../domains/user/key-ring";
import {check, matchedData, validationResult} from "express-validator";
import {useVaultApi} from "../../../../modules/api/provider/vault";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../modules/http/request/middleware/authMiddleware";
import {SwaggerTags} from "typescript-swagger";

@SwaggerTags('user')
@Controller("/user-key-rings")
export class UserKeyController {
    @Get("", [ForceLoggedInMiddleware])
    async getKeyRing(
        @Request() req: any,
        @Response() res: any
    ) : Promise<UserKeyRing> {
        return getUserKeyRouteHandler(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async addKeyRing(
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>,
    ) : Promise<UserKeyRing> {
        return addUserKeyRouteHandler(req, res);
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async dropKeyRing(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<UserKeyRing> {
        return dropUserKeyRouteHandler(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async editKeyRing(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>
    ) : Promise<UserKeyRing> {
        return editUserKeyRouteHandler(req, res);
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

        await useVaultApi().uploadUserPublicKey(req.user.id, {
            heKey: entity.he_key,
            publicKey: entity.public_key
        });

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
        await useVaultApi().uploadUserPublicKey(req.user.id, {
            publicKey: entity.public_key,
            heKey: entity.he_key
        });

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

        await useVaultApi().dropUserPublicKey(req.user.id);

        await repository.remove(entity);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'The key ring could not be deleted...'})
    }
}
