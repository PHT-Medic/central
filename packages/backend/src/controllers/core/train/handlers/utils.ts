/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Train, TrainType } from '@personalhealthtrain/ui-common';
import { check, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { ExpressRequest } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';
import { matchedValidationData } from '../../../../modules/express-validator';
import { TrainFileEntity } from '../../../../domains/core/train-file/entity';
import { MasterImageEntity } from '../../../../domains/core/master-image/entity';

export async function runTrainValidation(
    req: ExpressRequest,
    operation: 'create' | 'update',
) : Promise<Partial<Train>> {
    if (operation === 'create') {
        await check('proposal_id')
            .exists()
            .isUUID()
            .run(req);

        await check('type')
            .exists()
            .notEmpty()
            .isString()
            .custom((value) => Object.values(TrainType).includes(value))
            .run(req);
    }

    await check('name')
        .notEmpty()
        .optional({ nullable: true })
        .isLength({ min: 1, max: 128 })
        .run(req);

    await check('entrypoint_file_id')
        .custom((value) => getRepository(TrainFileEntity).findOne(value).then((res) => {
            if (typeof res === 'undefined') throw new Error('The entrypoint file is not valid.');
        }))
        .optional({ nullable: true })
        .run(req);

    await check('hash_signed')
        .notEmpty()
        .isLength({ min: 10, max: 8096 })
        .optional({ nullable: true })
        .run(req);

    await check('master_image_id')
        .optional({ nullable: true })
        .isString()
        .custom((value) => getRepository(MasterImageEntity).findOne(value).then((res) => {
            if (typeof res === 'undefined') throw new Error('The master image is not valid.');
        }))
        .run(req);

    await check('query')
        .isString()
        .isLength({ min: 1, max: 4096 })
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    return matchedValidationData(req, { includeOptionals: true });
}
