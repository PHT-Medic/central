/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isTrainStationApprovalStatus } from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest } from '../../../../type';
import { ExpressValidationError, matchedValidationData } from '../../../../express-validation';
import { TrainStationValidationResult } from '../type';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { TrainEntity } from '../../../../../domains/core/train/entity';
import { ProposalStationEntity } from '../../../../../domains/core/proposal-station/entity';

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
            .custom((value) => isTrainStationApprovalStatus(value))
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

    if (result.data.train_id) {
        const trainRepository = getRepository(TrainEntity);
        const train = await trainRepository.findOne(result.data.train_id);
        if (typeof train === 'undefined') {
            throw new NotFoundError('The referenced train is invalid.');
        }

        if (
            !isPermittedForResourceRealm(req.realmId, train.realm_id)
        ) {
            throw new NotFoundError('The referenced train realm is not permitted.');
        }

        result.data.train_realm_id = train.realm_id;

        result.meta.train = train;
    }

    if (result.data.station_id) {
        const stationRepository = getRepository(StationEntity);
        const station = await stationRepository.findOne(result.data.station_id);
        if (typeof station === 'undefined') {
            throw new NotFoundError('The referenced station is invalid.');
        }

        result.data.station_realm_id = station.realm_id;

        result.meta.station = station;
    }

    if (
        result.meta.station &&
        result.meta.train
    ) {
        const proposalStationRepository = getRepository(ProposalStationEntity);
        const proposalStation = await proposalStationRepository.findOne({
            proposal_id: result.meta.train.proposal_id,
            station_id: result.meta.station.id,
        });

        if (typeof proposalStation === 'undefined') {
            throw new NotFoundError('The referenced station is not part of the train proposal.');
        }

        result.meta.proposalStation = proposalStation;
    }

    // ----------------------------------------------

    return result;
}
