/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Express, NextFunction } from 'express';
import { ExpressRequest as AuthExpressRequest, ExpressResponse as AuthExpressResponse } from '@authelion/api-core';

export interface ExpressAppInterface extends Express {

}

export interface ExpressRequest extends AuthExpressRequest {

}

export type ExpressResponseMessage = {
    statusMessage?: string;
    statusCode?: number;
    data?: any;
};

export interface ExpressResponse extends AuthExpressResponse {
}

export interface ExpressNextFunction extends NextFunction {

}
