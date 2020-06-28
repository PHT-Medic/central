import {onlyOneRow} from "../../../db/helpers/queryHelper";
import UserModel from '../../../domains/user/UserModel';
import AuthUserEntity from "../../../domains/user/AuthUserEntity";
import UserEntity from "../../../domains/user/UserEntity";

import AuthConfig, {AuthLAPMode} from "../../../config/auth";
import AuthorizationService from "../../auth/authorizationService";
import TokenProvider from "../../auth/providers/LAP/tokenProvider";

const checkAuthenticated = async (req: any, res: any, next: any) => {
    let { authorization } = req.headers;

    let userObject: UserEntity | null = null;
    let userId: number | null | undefined;

    if(typeof authorization !== "undefined") {
        let provider;

        let token = authorization.split(" ")[1];

        switch (AuthConfig.lapMode) {
            case AuthLAPMode.LAPBasic:
                provider = new TokenProvider();

                if((token = await provider.verifyToken(token)) === false) {
                    res.cookie('token', null, {maxAge: Date.now()});

                    return res._failUnauthorized({message: 'The provided token was not valid.', errorCode: 'invalid_token'});
                }

                userId = token.id;
                break;
                case AuthLAPMode.LAPOauth2:
                    return res._failServerError({message: 'Oauth2 token validation is not implemented yet....', errorCode: 'not_implemented'});
        }

        if(typeof userId === 'undefined' || !userId) {
            return res._failUnauthorized({message: 'Es konnte kein Benutzer zu dem Token assoziert werden.'});
        }

        let query = UserModel()._find({id: userId});

        try {
            let {password, ...user} = <AuthUserEntity> await onlyOneRow(query);
            userObject = <UserEntity> user;

        } catch (e) {
            return res._failUnauthorized({message: 'Der Benutzer existiert nicht mehr.'});
        }
    }

    req.user = userObject;
    req.ability = await AuthorizationService.defineAbilityFor(userId);
    next();
};

const forceLoggedIn = async (req: any, res: any, next: any) => {
    if(req.user == null) {
        res._failUnauthorized({message: 'No token provided.'});
        return;
    }

    next();
};

export {
    checkAuthenticated,
    forceLoggedIn
}
