import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { PermissionID } from '@personalhealthtrain/ui-common';
import { TrainStationEntity } from '../../../../domains/core/train-station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { runTrainStationValidation } from './utils';

export async function updateTrainStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError('The train-station id is not valid.');
    }

    const repository = getRepository(TrainStationEntity);
    let trainStation = await repository.findOne(id);

    if (typeof trainStation === 'undefined') {
        throw new NotFoundError();
    }

    const isAuthorityOfStation = isPermittedForResourceRealm(req.realmId, trainStation.station_realm_id);
    const isAuthorizedForStation = req.ability.hasPermission(PermissionID.TRAIN_APPROVE);

    const isAuthorityOfTrain = isPermittedForResourceRealm(req.realmId, trainStation.train_realm_id);
    const isAuthorizedForTrain = req.ability.hasPermission(PermissionID.TRAIN_EDIT);

    if (
        !(isAuthorityOfStation && isAuthorizedForStation) &&
        !(isAuthorityOfTrain && isAuthorizedForTrain)
    ) {
        throw new ForbiddenError();
    }

    const data : Partial<TrainStationEntity> = await runTrainStationValidation(req, 'update');

    if (!isAuthorityOfStation) {
        if (data.approval_status) {
            delete data.approval_status;
        }

        if (data.comment) {
            delete data.comment;
        }
    }

    if (!isAuthorityOfTrain) {
        if (data.position) {
            delete data.position;
        }
    }

    trainStation = repository.merge(trainStation, data);

    trainStation = await repository.save(trainStation);

    return res.respondCreated({
        data: trainStation,
    });
}
