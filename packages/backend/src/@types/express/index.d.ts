import {User as DomainUser} from "../../domains/user";
import {PermissionInterface} from "../../modules/auth";
import {Result} from "express-validator";
import {AbilityManager} from "@typescript-auth/core";

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
            permissions: PermissionInterface[],
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
