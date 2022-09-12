/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Express, NextFunction, Request, Response,
} from 'express';
import {
    ExpressRequest as AuthExpressRequest,
    ExpressResponse as AuthExpressResponse,
} from '@authelion/server-adapter';
import { Environment } from '../../env';
import { Config } from '../module';

export interface ExpressAppInterface extends Express {

}

export type ExpressAppContext = {
    env: Environment,
    config: Config
};

// -------------------------------------------------------

export type ExpressRequest = AuthExpressRequest & Request;

export declare type ExpressResponseMessage = {
    statusMessage?: string;
    statusCode?: number;
    data?: any;
};

export type ExpressResponse = AuthExpressResponse & Response & {
    respond(message?: ExpressResponseMessage): void;
    respondDeleted(message?: ExpressResponseMessage): void;
    respondCreated(message?: ExpressResponseMessage): void;
    respondAccepted(message?: ExpressResponseMessage): void;
};

export interface ExpressNextFunction extends NextFunction {

}
