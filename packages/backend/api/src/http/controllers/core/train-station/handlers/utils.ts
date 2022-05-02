/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { TrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest } from '../../../../type';
import {
    ExpressValidationError,
    buildExpressValidationErrorMessage,
    matchedValidationData,
} from '../../../../express-validation';
import { TrainStationValidationResult } from '../type';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';
import { extendExpressValidationResultWithStation } from '../../station/utils/extend';
import { extendExpressValidationResultWithTrain } from '../../train/utils/extend';

export async function runTrainStationValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<TrainStationValidationResult> {
    const result : TrainStationValidationResult = {
        data: {},
        meta: {},
    };
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

    await extendExpressValidationResultWithTrain(result);
    if (result.meta.train) {
        if (
            !isPermittedForResourceRealm(req.realmId, result.meta.train.realm_id)
        ) {
            throw new BadRequestError(buildExpressValidationErrorMessage('train_id'));
        }

        result.data.train_realm_id = result.meta.train.realm_id;
    }

    await extendExpressValidationResultWithStation(result);
    if (result.meta.station) {
        result.data.station_realm_id = result.meta.station.realm_id;
    }

    if (
        result.meta.station &&
        result.meta.train
    ) {
        const dataSource = await useDataSource();
        const proposalStationRepository = dataSource.getRepository(ProposalStationEntity);
        const proposalStation = await proposalStationRepository.findOneBy({
            proposal_id: result.meta.train.proposal_id,
            station_id: result.meta.station.id,
        });

        if (!proposalStation) {
            throw new NotFoundError('The referenced station is not part of the train proposal.');
        }

        result.meta.proposalStation = proposalStation;
    }

    // ----------------------------------------------

    return result;
}
