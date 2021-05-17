import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";

import {TrainStation} from "../../../../domains/pht/train/station";

import {isRealmPermittedForResource} from "../../../../modules/auth/utils";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";
import {Train} from "../../../../domains/pht/train";
import {onlyRealmPermittedQueryResources} from "../../../../db/utils";
import {isTrainStationState} from "../../../../domains/pht/train/station/states";
import {applyRequestPagination} from "../../../../db/utils/pagination";

export async function getTrainStationsRouteHandler(req: any, res: any) {
    let { filter, page } = req.query;

    try {
        const repository = getRepository(TrainStation);
        let query = await repository.createQueryBuilder('trainStation')
            .leftJoinAndSelect('trainStation.train', 'train')
            .leftJoinAndSelect('trainStation.station', 'station');

        onlyRealmPermittedQueryResources(query, req.user.realm_id, ['train.realm_id', 'station.realm_id']);

        applyRequestFilterOnQuery(query, filter, {
            trainId: 'trainStation.train_id',
            stationId: 'trainStation.station_id'
        });

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
    } catch (e) {
        console.log(e);
        return res._failServerError();
    }
}

export async function getTrainStationRouteHandler(req: any, res: any) {
    let {id} = req.params;

    try {
        const repository = getRepository(TrainStation);
        let entity = await repository.findOne(id, {relations: ['train', 'station']});

        if (typeof entity === 'undefined') {
            return res._failNotFound();
        }

        if(
            !isRealmPermittedForResource(req.user, entity.train) &&
            !isRealmPermittedForResource(req.user, entity.station)
        ) {
            return res._failForbidden();
        }

        return res._respond({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}

export async function addTrainStationRouteHandler(req: any, res: any) {
    await check('station_id')
        .exists()
        .isInt()
        .run(req);

    await check('train_id')
        .exists()
        .isString()
        .run(req);

    await check('position')
        .exists()
        .isInt()
        .optional({nullable: true})
        .run(req);

    if(!req.ability.can('edit','train')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const trainRepository = getRepository(Train);
    const train = await trainRepository.findOne(data.train_id);

    if(typeof train === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, train)) {
        return res._failForbidden();
    }

    const repository = getRepository(TrainStation);

    let entity = repository.create(data);

    try {
        entity = await repository.save(entity);

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function editTrainStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if(typeof id !== "string") {
        return res._failBadRequest({message: 'the train-station id is not valid.'});
    }

    const repository = getRepository(TrainStation);
    let trainStation = await repository.findOne(id, {relations: ['station', 'train']});

    if(typeof trainStation === 'undefined') {
        return res._failNotFound();
    }

    const isAuthorityOfStation = isRealmPermittedForResource(req.user, trainStation.station);
    const isAuthorizedForStation = req.ability.can('approve','train');

    const isAuthorityOfRealm = isRealmPermittedForResource(req.user, trainStation.train);
    const isAuthorizedForRealm = req.ability.can('edit','train');

    if(
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfRealm && isAuthorizedForRealm)
    ) {
        return res._failForbidden();
    }

    if(isAuthorityOfStation) {
        await check('status')
            .optional()
            .custom(value => isTrainStationState(value))
            .run(req);

        await check('comment')
            .optional({nullable: true})
            .isString()
            .run(req);
    }

    if(isAuthorityOfRealm) {
        await check('position')
            .exists()
            .isInt()
            .optional({nullable: true})
            .run(req);
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    trainStation = repository.merge(trainStation, data);

    try {
        trainStation = await repository.save(trainStation);

        return res._respondCreated({
            data: trainStation
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropTrainStationRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if(!req.ability.can('edit', 'train') && !req.ability.can('approve', 'train')) {
        return res._failForbidden();
    }

    const repository = getRepository(TrainStation);

    let entity : TrainStation | undefined = await repository.findOne(id, {relations: ['train', 'station']});

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(
        !isRealmPermittedForResource(req.user, entity.station) &&
        !isRealmPermittedForResource(req.user, entity.train)
    ) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
