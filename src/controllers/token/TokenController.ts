import TokenService from '../../services/auth/helpers/tokenHelper';

//---------------------------------------------------------------------------------

import AuthUserModel from "../../domains/auth/user/AuthUserModel";
import AuthUserEntity from "../../domains/auth/user/AuthUserEntity";

//---------------------------------------------------------------------------------

const grantToken = async (req: any, res: any) => {
    const {name, password} = req.body;

    let user: AuthUserEntity;

    try {
        user = await AuthUserModel().verifyCredentials({name, password});
    } catch (e) {
        return res._failValidationError({message: e.message});
    }

    const {token, expiresIn} = await TokenService.createToken(user);

    res.cookie('token',token,{maxAge: expiresIn});

    return res._respond({
        data: {
            token: token,
            expiresIn: expiresIn
        }
    });
};

//---------------------------------------------------------------------------------

const revokeToken = async (req: any, res: any) => {
    res.cookie('token', null, {maxAge: Date.now()});
    return res._respond();
};

//---------------------------------------------------------------------------------

export default {
    grantToken,
    revokeToken
};
