/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { ScanResult } from 'docker-scan';
import { ServiceID } from '@personalhealthtrain/central-common';
import { ForbiddenError } from '@ebec/http';
import { Request, Response, sendAccepted } from 'routup';
import { useRequestEnv } from '../../../../../request';
import { RequestValidationError } from '../../../../../validation';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

export async function syncPushedMasterImages(req: Request, res: Response) : Promise<any> {
    const robot = useRequestEnv(req, 'robot');
    if (!robot || robot.name !== ServiceID.GITHUB) {
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
        throw new RequestValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true }) as ScanResult;

    // languages
    const groups = await mergeMasterImageGroupsWithDatabase(data.groups);

    // images
    const images = await mergeMasterImagesWithDatabase(data.images);

    return sendAccepted(res, {
        groups,
        images,
    });
}
