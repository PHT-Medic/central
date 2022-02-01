/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { ScanResult } from 'docker-scan';
import { ServiceID } from '@personalhealthtrain/ui-common';
import { ForbiddenError } from '@typescript-error/http';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { ExpressValidationError } from '../../../../../error/validation';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

export async function syncPushedMasterImages(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.robot || req.robot.name !== ServiceID.GITHUB) {
        throw new ForbiddenError('Only the Github service is permitted to use this endpoint.');
    }

    await check('images')
        .exists()
        .isArray()
        .run(req);

    await check('groups')
        .exists()
        .isArray()
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true }) as ScanResult;

    // languages
    const groups = await mergeMasterImageGroupsWithDatabase(data.groups);

    // images
    const images = await mergeMasterImagesWithDatabase(data.images);

    return res.respondAccepted({
        data: {
            groups,
            images,
        },
    });
}
