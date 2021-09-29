
/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Result} from "express-validator";
import {AbilityManager, OwnedPermission} from "@typescript-auth/core";

type RespondMessage = {
    statusMessage?: string,
    statusCode?: number,
    data?: any
};

type RespondErrorMessage = {
    statusMessage?: string,
    statusCode?: number,
    message?: string,
    code?: string
}

declare global {
    namespace Express {
        export interface Request {
            user?: DomainUser,
            userId?: number,
            token?: string,
            permissions: OwnedPermission<unknown>[],
            ability: AbilityManager
        }

        export interface Response {
            _respond(message?: RespondMessage): void,

            _respondDeleted(message?: RespondMessage): void,

            _respondCreated(message?: RespondMessage): void,

            _respondAccepted(message?: RespondMessage): void,

            _respondException(message?: RespondErrorMessage): void,

            _fail(message?: RespondErrorMessage): void,

            _failUnauthorized(message?: RespondErrorMessage): void,

            _failForbidden(message?: RespondErrorMessage): void,

            _failNotFound(message?: RespondErrorMessage): void,

            _failBadRequest(message?: RespondErrorMessage): void,

            _failValidationError(message?: RespondErrorMessage): void,

            _failServerError(message?: RespondErrorMessage): void,

            _failExpressValidationError(message?: Result): void
        }
    }
}
