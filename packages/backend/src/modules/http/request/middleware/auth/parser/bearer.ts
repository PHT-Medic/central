import {getCustomRepository} from "typeorm";
import {verifyToken} from "../../../../../auth/utils/token";
import {UserRepository} from "../../../../../../domains/user/repository";
import {AuthorizationParserResult} from "./index";

export async function parseAuthorizationBearer(token: string): Promise<AuthorizationParserResult> {
    const tokenInfo = await verifyToken(token);

    const userId: number | undefined = tokenInfo.id;
    const remoteAddress: string = tokenInfo.remoteAddress;

    if (typeof userId !== 'number') {
        throw new Error('The bearer token could not be associated to a user.');
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findOne(userId, {relations: ['realm']});

    if (typeof user === 'undefined') {
        throw new Error('The user does not exist.');
    }

    return {
        type: 'user',
        entity: user,
        remoteAddress
    };
}
