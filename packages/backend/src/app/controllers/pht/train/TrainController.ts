import {getRepository} from "typeorm";
import {applyRequestPagination, applyRequestIncludes, applyRequestFilter} from "typeorm-extension";
import {onlyRealmPermittedQueryResources} from "../../../../domains/realm/db/utils";
import {check, matchedData, validationResult} from "express-validator";
import {isRealmPermittedForResource} from "../../../../modules/auth/utils";
import {Train} from "../../../../domains/train";
import {MasterImage} from "../../../../domains/master-image";
import {Proposal} from "../../../../domains/proposal";
import {isTrainType} from "../../../../domains/train/types";
import {
    TrainConfiguratorStateFinished,
    TrainConfiguratorStateHashGenerated,
    TrainConfiguratorStateHashSigned, TrainStateConfigured
} from "../../../../domains/train/states";
import {TrainFile} from "../../../../domains/train/file";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../modules/http/request/middleware/auth";
import {doTrainTaskRouteHandler} from "./TrainActionController";

type PartialTrain = Partial<Train>;
const simpleExample = {
    user_id: 1,
    proposal_id: 1,
    hash: 'xxx',
    hash_signed: 'xxx',
    session_id: 'xxx',
    // @ts-ignore
    files: [],
    status: TrainStateConfigured
}

enum TrainTask {
    START = 'start',
    STOP = 'stop',
    BUILD = 'build',
    SCAN_HARBOR = 'scanHarbor',
    GENERATE_HASH = 'generateHash'
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

    @Post("/:id/task",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrain>(simpleExample)
    async doTask(
        @Params('id') id: string,
        @Body() data: {
            task: TrainTask
        },
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrain|undefined> {
        return await doTrainTaskRouteHandler(req, res) as PartialTrain | undefined;
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

export async function getTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train')
        .leftJoinAndSelect('train.train_stations','trainStations')
        .leftJoinAndSelect('trainStations.station', 'station')
        .where("train.id = :id", {id});

    onlyRealmPermittedQueryResources(query, req.user.realm_id, 'train.realm_id');

    const entity = await query.getOne();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getTrainsRouteHandler(req: any, res: any) {
    const { filter, page, include } = req.query;

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train');

    onlyRealmPermittedQueryResources(query, req.user.realm_id, 'train.realm_id');

    applyRequestIncludes(query, 'train', include, {
        trainStations: 'train_stations',
        result: 'result',
        user: 'user'
    });

    applyRequestFilter(query, filter, {
        id: 'train.id',
        name: 'train.name',
        proposalId: 'train.proposal_id',
        realmId: 'train.realm_id'
    });

    const pagination = applyRequestPagination(query, page, 50);

    query.orderBy({
        'train.updated_at': "DESC"
    });

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

async function runTrainValidations(req: any) {
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
        .isInt()
        .optional()
        .custom(value => {
            return getRepository(MasterImage).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('The master image is not valid.');
            })
        });

    await masterImagePromise.run(req);
}

export async function addTrainRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','train')) {
        return res._failForbidden();
    }

    await check('proposal_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(Proposal).find(value).then((proposalResult) => {
                if(typeof proposalResult === 'undefined') throw new Error('The referenced proposal does not exist.');
                // todo: check if is request realm id is equal to proposal realm id.
            })
        })
        .run(req);

    await check('type')
        .exists()
        .notEmpty()
        .isString()
        .custom(value => {
            if(!isTrainType(value)) {
                throw new Error('The train type is not valid');
            }

            return true;
        })
        .run(req);

    await runTrainValidations(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    // tslint:disable-next-line:prefer-const
    let {station_ids, ...data} = validationData;

    try {
        const repository = getRepository(Train);

        const entity = repository.create({
            realm_id: req.user.realm_id,
            user_id: req.user.id,
            ...data
        });

        await repository.save(entity);

        return res._respond({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'The train could not be created.'})
    }
}

export async function editTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
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
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req);
    if(!data) {
        return res._respondAccepted();
    }

    const repository = getRepository(Train);
    let train = await repository.findOne(id);

    if(typeof train === 'undefined') {
        return res._failValidationError({message: 'The train could not be found.'});
    }

    if(!isRealmPermittedForResource(req.user, train)) {
        return res._failForbidden();
    }

    train = repository.merge(train, data);

    if(train.hash) {
        train.configurator_status = TrainConfiguratorStateHashGenerated;

        if(train.hash_signed) {
            train.configurator_status = TrainConfiguratorStateHashSigned;
        }
    }

    // check if all conditions are met
    if(train.hash_signed && train.hash) {
        train.configurator_status = TrainConfiguratorStateFinished;
        train.status = TrainStateConfigured;
    }

    try {
        const result = await repository.save(train);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'The train could not be updated.'});
    }
}

export async function dropTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    if(!req.ability.can('drop', 'train')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'The train could not be deleted.'})
    }
}

