/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { deleteUndefinedObjectProperties } from '@personalhealthtrain/ui-common';
import { MatchedDataOptions, matchedData } from 'express-validator';
import { ExpressRequest } from '../../config/http/type';

export function matchedValidationData(req: ExpressRequest, options?: Partial<MatchedDataOptions>) : Record<string, any> {
    return deleteUndefinedObjectProperties(matchedData(req, options));
}
