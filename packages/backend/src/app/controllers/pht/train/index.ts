/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyPagination, applyQueryRelations, applyFilters} from "typeorm-extension";
import {
    isPermittedForResourceRealm,
    onlyRealmPermittedQueryResources, PermissionID, Proposal, Train, TrainFile, TrainType
} from "@personalhealthtrain/ui-common";
import {check, matchedData, validationResult} from "express-validator";
import {TrainCommand} from "@personalhealthtrain/ui-common";
import {MasterImage} from "@personalhealthtrain/ui-common";
import {
    TrainConfigurationStatus
} from "@personalhealthtrain/ui-common";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {handleTrainCommandRouteHandler} from "./action";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {ExpressRequest, ExpressResponse} from "../../../../config/http/type";
import {BadRequestError, ForbiddenError, NotFoundError} from "@typescript-error/http";
import {ExpressValidationError} from "../../../../config/http/error/validation";

type PartialTrain = Partial<Train>;
const simpleExample = {
    user_id: 1,
    proposal_id: 1,
    hash: 'xxx',
    hash_signed: 'xxx',
    session_id: 'xxx',
    // @ts-ignore
    files: []
}

@SwaggerTags('pht')
@Controller("/trains")
export class TrainController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain[]> {
        return await getTrainsRouteHandler(req, res) as PartialTrain[];
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await getTrainRouteHandler(req, res) as PartialTrain | undefined;
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: PartialTrain,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await editTrainRouteHandler(req, res) as PartialTrain | undefined;
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async add(
        @Body() data: PartialTrain,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await addTrainRouteHandler(req, res) as PartialTrain | undefined;
    }

    @Post("/:id/command",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async doTask(
        @Params('id') id: string,
        @Body() data: {
            command: TrainCommand
        },
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await handleTrainCommandRouteHandler(req, res);
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await dropTrainRouteHandler(req, res) as PartialTrain | undefined;
    }

    // --------------------------------------------------------------------------
}

export async function getTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { include } = req.query;
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train')
        .where("train.id = :id", {id});

    onlyRealmPermittedQueryResources(query, req.realmId, 'train.realm_id');

    applyQueryRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['train_stations', 'user', 'proposal']
    });

    const entity = await query.getOne();

    if(typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if(!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({data: entity})
}

export async function getTrainsRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, include } = req.query;

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train');

    onlyRealmPermittedQueryResources(query, req.realmId, 'train.realm_id');

    applyQueryRelations(query, include, {
        defaultAlias: 'train',
        allowed: ['train_stations', 'user', 'proposal']
    });

    applyFilters(query, filter, {
        defaultAlias: 'train',
        allowed: ['id', 'name', 'proposal_id', 'realm_id']
    });

    const pagination = applyPagination(query, page, {maxLimit: 50});

    query.orderBy("train.updated_at", "DESC");

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

async function runTrainValidations(req: ExpressRequest) {
    await check('entrypoint_executable')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 1, max: 100})
        .run(req);

    await check('query')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 1, max: 4096})
        .run(req);

    await check('entrypoint_file_id')
        .exists()
        .optional()
        .custom(value => {
            return getRepository(TrainFile).findOne(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('The entrypoint file is not valid.');
            }).catch(e => console.log(e));
        })
        .run(req);

    const masterImagePromise = check('master_image_id')
        .exists()
        .optional()
        .isString()
        .custom(value => {
            return getRepository(MasterImage).findOne(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('The master image is not valid.');
            })
        });

    await masterImagePromise.run(req);
}

export async function addTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if(!req.ability.hasPermission(PermissionID.TRAIN_ADD)) {
        throw new ForbiddenError();
    }

    await check('proposal_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(Proposal).findOne(value).then((proposal) => {
                if(typeof proposal === 'undefined') throw new Error('The referenced proposal does not exist.');

                if(proposal.realm_id !== req.realmId) {
                    throw new Error('You are not permitted to create a train for that realm.')
                }
            })
        })
        .run(req);

    await check('type')
        .exists()
        .notEmpty()
        .isString()
        .custom(value => {
            return Object.values(TrainType).includes(value);
        })
        .run(req);

    await runTrainValidations(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    // tslint:disable-next-line:prefer-const
    let {station_ids, ...data} = validationData;

    const repository = getRepository(Train);

    const entity = repository.create({
        realm_id: req.realmId,
        user_id: req.user.id,
        ...data
    });

    await repository.save(entity);

    return res.respond({data: entity});

}

export async function editTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    await runTrainValidations(req);

    await check('hash_signed')
        .exists()
        .notEmpty()
        .isLength({min: 10, max: 8096})
        .optional({nullable: true})
        .run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req);
    if(!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(Train);
    let train = await repository.findOne(id);

    if(typeof train === 'undefined') {
        throw new NotFoundError();
    }

    if(!isPermittedForResourceRealm(req.realmId, train.realm_id)) {
        throw new ForbiddenError();
    }

    train = repository.merge(train, data);

    if(train.hash) {
        train.configuration_status = TrainConfigurationStatus.HASH_GENERATED;

        if(train.hash_signed) {
            train.configuration_status = TrainConfigurationStatus.HASH_SIGNED;
        }
    }

    // check if all conditions are met
    if(train.hash_signed && train.hash) {
        train.configuration_status = TrainConfigurationStatus.FINISHED;
        train.run_status = null;
    }

    const result = await repository.save(train);

    return res.respondAccepted({
        data: result
    });
}

export async function dropTrainRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    if(!req.ability.hasPermission(PermissionID.TRAIN_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if(!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({data: entity});
}

