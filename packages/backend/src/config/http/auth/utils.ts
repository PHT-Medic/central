import {AbilityManager, AuthorizationHeaderValue} from "@typescript-auth/core";
import {verifyToken} from "@typescript-auth/server";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../domains/auth/user/repository";
import {Client} from "../../../domains/auth/client";
import {getWritableDirPath} from "../../paths";
import {useLogger} from "../../../modules/log";
import {TokenPayload} from "../../../domains/auth/token/type";
import {UnauthorizedError} from "../error/unauthorized";

export async function authenticateWithAuthorizationHeader(request: any, value: AuthorizationHeaderValue) : Promise<void> {
    try {
        switch (value.type) {
            case "Bearer":
                const tokenPayload : TokenPayload = await verifyToken(value.token, {
                    directory: getWritableDirPath()
                });

                const {sub: userId, remoteAddress} = tokenPayload;

                if(typeof userId === 'undefined' || typeof remoteAddress === 'undefined') {
                    return;
                }

                const allowedIps : string[] = ['::1', '::ffff:127.0.0.1'];
                if(allowedIps.indexOf(request.ip) === -1) {
                    if (typeof remoteAddress !== 'undefined' && remoteAddress !== request.ip) {
                        // maybe throw error to inform, that the ip address changed.
                        return;
                    }
                }

                const userRepository = getCustomRepository<UserRepository>(UserRepository);
                const user = await userRepository.findOne(userId, {relations: ['realm']});

                if (typeof user === 'undefined') {
                    throw new UnauthorizedError();
                }

                const permissions =  await userRepository.getOwnedPermissions(user.id);

                request.user = user;
                request.userId = user.id;
                request.realmId = user.realm_id;

                request.ability = new AbilityManager(permissions);
                break;
            case "Basic":
                const clientRepository = getRepository(Client);
                const client = await clientRepository.findOne({
                    id: value.username,
                    secret: value.password
                }, {relations: ['service']});

                if(typeof client === 'undefined') {
                    throw new UnauthorizedError();
                }

                if(!client.service) {
                    // only allow services for now... ^^
                    return;
                }

                request.service = client.service;
                request.serviceId = client.service.id;
                request.realmId = client.service.realm_id;

                request.ability = new AbilityManager([]);
                break;
        }
    } catch (e) {
        useLogger().error(e.message);

        throw e;
    }
}

export function parseCookie(request: any) : string | undefined {
    try {
        if (typeof request.cookies?.auth_token !== 'undefined') {
            const {accessToken} = JSON.parse(request.cookies?.auth_token);

            return accessToken;
        }
    } catch (e) {
        // don't handle error, this is just fine :)
    }

    return undefined;
}
