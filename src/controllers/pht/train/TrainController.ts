import {getRepository, In} from "typeorm";
import {Station} from "../../../domains/pht/station";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../../db/utils";
import {check, matchedData, validationResult} from "express-validator";
import {isPermittedToOperateOnRealmResource} from "../../../services/auth/utils";
import {Train} from "../../../domains/pht/train";
import {MasterImage} from "../../../domains/pht/master-image";
import {Proposal} from "../../../domains/pht/proposal";
import {isTrainType} from "../../../domains/pht/train/types";
import {
    TrainStateCreated,
    TrainStateHashGenerated,
    TrainStateHashSigned,
    TrainStateRunning
} from "../../../domains/pht/train/states";
import {generateTrainHash, startTrain} from "../../../services/pht/configurator/train-builder";
import {createTrainBuilderMessage} from "../../../services/pht/configurator";

export async function getTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getTrainsRouteHandler(req: any, res: any) {
    let { filter } = req.query;

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train')
        .leftJoinAndSelect('train.stations','stations')
        .leftJoinAndSelect('train.result', 'result')

    queryFindPermittedResourcesForRealm(query, req.user.realm_id);

    applyRequestFilterOnQuery(query, filter, {
        id: 'train.id',
        name: 'train.name',
        proposalId: 'train.proposal_id',
        realmId: 'train.realm_id'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

async function runTrainValidations(req: any, editMode: boolean = false) {
    await check('entrypoint_name')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 3, max: 255})
        .run(req);
    await check('entrypoint_command')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 3, max: 255})

    const masterImagePromise = check('master_image_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(MasterImage).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('Das Master Image existiert nicht.');
            })
        });

    if(editMode) {
        masterImagePromise.optional();
    }

    await masterImagePromise.run(req);

    const stationPromise = check('station_ids')
        .isArray()
        .custom((value: any[]) => {
            return getRepository(Station).find({id: In(value)}).then((res) => {
                if(!res || res.length !== value.length) throw new Error('Die angegebenen Krankenhäuser sind nicht gültig');
            })
        });

    if(editMode) {
        stationPromise.optional();
    }

    await stationPromise.run(req);
}

export async function addTrainRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','train')) {
        return res._failForbidden();
    }

    await check('proposal_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(Proposal).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('Der Antrag existiert nicht.');
            })
        })
        .run(req);

    await check('type')
        .exists()
        .notEmpty()
        .isString()
        .custom(value => {
            if(!isTrainType(value)) {
                throw new Error('Der Train Type ist nicht gültig.');
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

    let {station_ids, ...data} = validationData;

    station_ids = station_ids ?? [];

    try {
        const repository = getRepository(Train);
        const stationRepository = getRepository(Station);

        let entity = repository.create({
            realm_id: req.user.realm_id,
            user_id: req.user.id,
            stations: station_ids.map((stationId: number) => {
                return stationRepository.create({id: stationId});
            }),
            status: TrainStateCreated,
            ...data
        });

        await repository.save(entity);

        return res._respond({data: entity});
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Der Zug konnte nicht erstellt werden...'})
    }
}

export async function editTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    await runTrainValidations(req, true);

    await check('hash_signed')
        .exists()
        .notEmpty()
        .isLength({min: 10, max: 4096})
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
        return res._failValidationError({message: 'Der Zug konnte nicht gefunden werden.'});
    }

    if(!isPermittedToOperateOnRealmResource(req.user, train)) {
        return res._failForbidden();
    }

    train = repository.merge(train, data);

    if(train.hash) {
        train.status = TrainStateHashGenerated;
    }

    if(train.hash_signed) {
        train.status = TrainStateHashSigned;
    }

    try {
        const result = await repository.save(train);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'Der Zug konnte nicht aktualisiert werden.'});
    }
}

export async function dropTrainRouteHandler(req: any, res: any) {
    let { id } = req.params;

    id = parseInt(id);

    if(typeof id !== 'number' || Number.isNaN(id)) {
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

    if(!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Zug konnte nicht gelöscht werden...'})
    }
}

export async function doTrainActionRouteHandler(req: any, res: any) {
    let {id, action} = req.params;

    id = parseInt(id);

    if (typeof id !== 'number' || Number.isNaN(id)) {
        return res._failNotFound();
    }

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {relations: ['stations']});

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedToOperateOnRealmResource(req.user, entity)) {
        return res._failForbidden();
    }

    const allowedActions = ['start', 'stop', 'generateHash'];
    if(allowedActions.indexOf(action) === -1) {
        return res._failBadRequest();
    }

    const message : Record<string, any> = await createTrainBuilderMessage(entity);

    switch (action) {
        case 'generateHash':
            try {
                let hash : string;
                try {
                    hash = await generateTrainHash(message, req.token);
                } catch (e) {
                    hash = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63';
                }

                entity = repository.merge(entity, {
                    hash,
                    status: TrainStateHashGenerated
                });

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                console.log(e);
                return res._failBadRequest({message: e.message});
            }
        case 'start':
            if(!req.ability.can('start','trainExecution')) {
                return res._failForbidden();
            }

            try {
                await startTrain(message, req.token);

                entity = repository.merge(entity, {
                    status: TrainStateRunning
                });

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
    }
}
