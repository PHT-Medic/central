import {hasOwnProperty} from "typeorm-extension";
import env from "../../../env";
import {UnauthorizedError} from "../error/unauthorized";

export function errorMiddleware(error: Error, req: any, res: any, next: any) {
    if(env.env === 'development') {
        console.log(error);
    }

    if(error instanceof UnauthorizedError) {
        return res._failUnauthorized();
    }

    const code : string | undefined =
        hasOwnProperty(error, 'code') && typeof error.code === 'string' ?
            error.code :
            undefined;

    switch (code) {
        case 'ER_DUP_ENTRY':
            return res._failBadRequest({message: 'An entry with some unique attributes already exist.'})
        default:
            return res._failServerError();
    }
}
