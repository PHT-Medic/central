/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { ErrorCode, hasOwnProperty } from '@personalhealthtrain/central-common';
import {
    Next, Request, Response, useRequestPath,
} from 'routup';
import { useRequestEnv } from '../request';

export function checkLicenseAgreementAccepted(req: Request, res: Response, next: Next) {
    const user = useRequestEnv(req, 'user');
    if (user) {
        if (
            !hasOwnProperty(user, 'license_agreement') ||
            user.license_agreement !== 'accepted'
        ) {
            const url = useRequestPath(req);

            // todo: check url value

            if (
                url.startsWith('/user-attributes') ||
                url.startsWith('/token') ||
                url.startsWith('/users/@me') ||
                url.startsWith('/identity-providers')
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
