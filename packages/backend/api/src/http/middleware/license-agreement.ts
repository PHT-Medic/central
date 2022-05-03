/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';
import { ErrorCode, hasOwnProperty } from '@personalhealthtrain/central-common';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function checkLicenseAgreementAccepted(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    if (req.userId) {
        if (
            !req.user.extra ||
            !hasOwnProperty(req.user.extra, 'license_agreement') ||
            req.user.extra.license_agreement !== 'accepted'
        ) {
            if (
                req.originalUrl.startsWith('/user-attributes') ||
                req.originalUrl.startsWith('/token')
            ) {
                next();

                return;
            }

            throw new BadRequestError({
                code: ErrorCode.LICENSE_AGREEMENT,
                message: 'The license agreement must be accepted!',
            });
        }
    }

    next();
}
