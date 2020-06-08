import AuthUserModel from '../../../domains/auth/user/AuthUserModel';
import AuthUserEntity from "../../../domains/auth/user/AuthUserEntity";
import { verifyToken } from '../../auth/helpers/tokenHelper';
import {onlyOneRow} from "../../../db/helpers/queryHelper";
import UserEntity from "../../../domains/user/UserEntity";
import AuthorizationService from "../../auth/authorizationService";

const checkAuthenticated = async (req: any, res: any, next: any) => {
    let { authorization } = req.headers;

    let userObject: UserEntity | null = null;
    let userId: number | null = null;

    if(typeof authorization !== "undefined") {
        let token = authorization.split(" ")[1];

        if((token = await verifyToken(token)) === false) {
            res.cookie('token', null, {maxAge: Date.now()});

            return res._failUnauthorized({message: 'The provided token was not valid.', errorCode: 'invalid_token'});
        } else {
            let query = AuthUserModel()._find({id: token.id});

            try {
                let {password, ...user} = <AuthUserEntity> await onlyOneRow(query);
                userObject = <UserEntity> user;

                let { id } = user;
                userId = id;
            } catch (e) {
                return res._failUnauthorized({message: 'Der Benutzer existiert nicht mehr.'});
            }
        }
    }

    req.user = userObject;
    req.ability = await AuthorizationService.defineAbilitiesFor(userId);

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
