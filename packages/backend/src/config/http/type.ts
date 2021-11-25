/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, SERVICE_ID, User } from '@personalhealthtrain/ui-common';
import {
    Express, NextFunction, Request, Response,
} from 'express';
import { AbilityManager } from '@typescript-auth/core';
import { RespondMessage } from './middleware/response';

export interface ExpressAppInterface extends Express {

}

export interface ExpressRequest extends Request {
    user?: User,
    userId?: typeof User.prototype.id,

    clientId?: typeof Client.prototype.id,
    serviceId?: SERVICE_ID,

    realmId?: string,

    token?: string,

    ability: AbilityManager
}

export interface ExpressResponse extends Response {
    respond(message?: RespondMessage): void,

    respondDeleted(message?: RespondMessage): void,

    respondCreated(message?: RespondMessage): void,

    respondAccepted(message?: RespondMessage): void
}

export interface ExpressNextFunction extends NextFunction {

}
