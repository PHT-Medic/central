import UserAbility from "../../../../auth/utils/user-ability";
import {Middleware} from "@decorators/express";
import {NextFunction, Request, Response} from "express";
import {parseAuthorizationBearer} from "./parser/bearer";
import {parseAuthorizationSecret} from "./parser/secret";
import {User} from "../../../../../domains/user";
import {Service} from "../../../../../domains/service";
import {buildAuthPermissions} from "./permission";

export async function checkAuthenticated(req: any, res: any, next: any) {
    let { authorization } = req.headers;

    try {
        // todo: typing for req.cookies.auth_token;
        if (typeof req.cookies?.auth_token !== 'undefined') {
            const {accessToken} = JSON.parse(req.cookies?.auth_token);

            authorization = "Bearer " + accessToken;
        }
    } catch (e) {
        // todo: handle unexpected position
    }

    if(typeof authorization === "string") {
        const parts : string[] = authorization.split(" ");

        if(parts.length < 2) {
            return res._failUnauthorized({message: 'The format of the authorization token is not valid.', code: 'invalid_token'});
        }

        const authorizationType : 'bearer' | 'secret' | string = parts[0].toLowerCase();
        const authorizationData : string = parts[1];

        let clientType : AuthorizationClientType | undefined;
        let clientEntity : User | Service | undefined;

        switch (authorizationType) {
            case 'bearer':
                try {
                    const {remoteAddress, type, entity} = await parseAuthorizationBearer(authorizationData);

                    if(typeof remoteAddress !== 'undefined' && remoteAddress !== req.ip) {
                        return res._failUnauthorized({message: 'The ip address has changed.', code: 'invalid_ip'});
                    }

                    clientType = type;
                    clientEntity = entity;
                } catch (e) {
                    res.cookie('auth_token', null, {maxAge: Date.now()});

                    return res._failUnauthorized({message: e.message, code: 'invalid_token'});
                }
                break;
            case 'secret':
                try {
                    const {type, entity} = await parseAuthorizationSecret(authorizationData);

                    clientType = type;
                    clientEntity = entity;
                } catch (e) {
                    return res._failUnauthorized({message: e.message, code: 'invalid_secret'});
                }
                break;
        }

        if(
            typeof clientType !== 'undefined' &&
            typeof clientEntity !== 'undefined'
        ) {
            req.permissions = await buildAuthPermissions(clientType, clientEntity.id);

            switch (clientType) {
                case "service":
                    req.service = clientEntity as Service;
                    req.serviceId = req.service.id;
                    break;
                case "user":
                    req.user = clientEntity as User;
                    req.userId = req.user.id;
                    break;
            }
        }
    }

    if(typeof req.permissions === 'undefined') {
        req.permissions = [];
    }

    req.ability = new UserAbility(req.permissions);

    next();
}

export function forceLoggedIn(req: any, res: any, next: any) {
    if(typeof req.userId === 'undefined' && typeof req.serviceId === 'undefined') {
        res._failUnauthorized({message: 'You are not authenticated.'});
        return;
    }

    next();
}

export class ForceLoggedInMiddleware implements Middleware {
    public use(request: Request, response: Response, next: NextFunction) {
        return forceLoggedIn(request, response, next);
    }
}

export type AuthorizationClientType = 'user' | 'service';
