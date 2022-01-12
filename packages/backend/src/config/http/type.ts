/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ServiceID } from '@personalhealthtrain/ui-common';
import {
    Express, NextFunction,
} from 'express';
import {
    ExpressRequest as AuthExpressRequest,
    ExpressResponse as AuthExpressResponse,
} from '@typescript-auth/server';

export interface ExpressAppInterface extends Express {

}

export interface ExpressRequest extends AuthExpressRequest {
    serviceId?: ServiceID,
}

export interface ExpressResponse extends AuthExpressResponse {
}

export interface ExpressNextFunction extends NextFunction {

}
