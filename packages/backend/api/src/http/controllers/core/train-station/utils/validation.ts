/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { BadRequestError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/common';
import { Request } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { TrainStationEntity } from '../../../../../domains/core/train-station/entity';
import { TrainEntity } from '../../../../../domains/core/train';
import { useRequestEnv } from '../../../../request';
import {
    ExpressValidationError,
    ExpressValidationResult,
    buildExpressValidationErrorMessage,
    extendExpressValidationResultWithRelation,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../../express-validation';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';

export async function runTrainStationValidation(
    req: Request,
    operation: 'create' | 'update',
) : Promise<ExpressValidationResult<TrainStationEntity>> {
    const result : ExpressValidationResult<TrainStationEntity> = initExpressValidationResult();
    if (operation === 'create') {
        await check('station_id')
            .exists()
            .isUUID()
            .run(req);

        await check('train_id')
            .exists()
            .isUUID()
            .run(req);
    }

    await check('index')
        .exists()
        .isInt()
        .optional()
        .run(req);

    if (operation === 'update') {
        await check('approval_status')
            .optional({ nullable: true })
            .isIn(Object.values(TrainStationApprovalStatus))
            .run(req);

        await check('comment')
            .optional({ nullable: true })
            .isString()
            .run(req);
    }

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithRelation(result, TrainEntity, {
        id: 'train_id',
        entity: 'train',
    });
    if (result.relation.train) {
        if (
            !isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.train.realm_id)
        ) {
            throw new BadRequestError(buildExpressValidationErrorMessage('train_id'));
        }

        result.data.train_realm_id = result.relation.train.realm_id;
    }

    await extendExpressValidationResultWithRelation(result, StationEntity, {
        id: 'station_id',
        entity: 'station',
    });

    if (result.relation.station) {
        result.data.station_realm_id = result.relation.station.realm_id;
    }

    if (
        result.relation.station &&
        result.relation.train
    ) {
        const dataSource = await useDataSource();
        const proposalStationRepository = dataSource.getRepository(ProposalStationEntity);
        const proposalStation = await proposalStationRepository.findOneBy({
            proposal_id: result.relation.train.proposal_id,
            station_id: result.relation.station.id,
        });

        if (!proposalStation) {
            throw new NotFoundError('The referenced station is not part of the train proposal.');
        }
    }

    // ----------------------------------------------

    return result;
}
