//---------------------------------------------------------------------------------

import UserModel from "../../domains/user/UserModel";
import AuthUserEntity from "../../domains/user/AuthUserEntity";
import TokenResponseSchema from "../../domains/token/TokenResponseSchema";

import TokenProvider from "../../services/auth/providers/LAP/tokenProvider";

//---------------------------------------------------------------------------------

const grantToken = async (req: any, res: any) => {
    const {name, password} = req.body;

    let user: AuthUserEntity;

    try {
        user = await UserModel().verifyCredentials({name, password});
    } catch (e) {
        return res._failValidationError({message: e.message});
    }

    const tokenProvider = new TokenProvider();
    const {token, expiresIn} = await tokenProvider.createToken(user);

    res.cookie('token',token,{maxAge: expiresIn});

    let ob = {
        token,
        expires_in: expiresIn
    };

    let tokenResponseSchema = new TokenResponseSchema();
    ob = tokenResponseSchema.applySchemaOnEntity(ob);

    return res._respond({
        data: ob
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
