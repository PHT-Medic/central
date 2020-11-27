import AuthConfig from "../../../../config/auth";
import {verifyToken} from "../../../auth/helpers/tokenHelper";
import {PermissionInterface} from "../../../auth";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../../../domains/user/repository";
import {User} from "../../../../domains/user";
import UserAbility from "../../../auth/helpers/userAbility";

const checkAuthenticated = async (req: any, res: any, next: any) => {
    let { authorization } = req.headers;

    let user : User | undefined;
    let userId: number | undefined;
    let userToken: string | undefined;
    let userPermissions: PermissionInterface[] =  [];

    if(typeof authorization !== "undefined") {
        let token = authorization.split(" ")[1];

        switch (AuthConfig.lapMode) {
            case 'lapBasic':
                if((token = await verifyToken(token)) === false) {
                    res.cookie('token', null, {maxAge: Date.now()});

                    return res._failUnauthorized({message: 'Der angegebene Token ist nicht gültig.', errorCode: 'invalid_token'});
                }

                userToken = token;
                userId = token.id;
                break;
            case 'lapOauth2':
                return res._failServerError({message: 'Oauth2 Tokenvalidierung ist noch nicht implementiert....', errorCode: 'not_implemented'});
        }

        if(typeof userId === 'undefined' || !userId) {
            return res._failUnauthorized({message: 'Es konnte kein Benutzer zu dem Token assoziert werden.'});
        }

        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        user = await userRepository.findOne(userId, {relations: ['realm']});

        if(typeof user === 'undefined') {
            return res._failUnauthorized({message: 'Der Benutzer existiert nicht mehr.'});
        }

        userPermissions = await userRepository.findPermissions(user.id);
    }

    req.token = userToken;
    req.user = user;
    req.permissions = userPermissions;
    req.ability = new UserAbility(userPermissions);
    next();
};

const forceLoggedIn = async (req: any, res: any, next: any) => {
    if(typeof req.user === 'undefined') {
        res._failUnauthorized({message: 'Sie müssen angemeldet sein.'});
        return;
    }

    next();
};

export {
    checkAuthenticated,
    forceLoggedIn
}
