import fs from 'fs';
import { sign, verify } from 'jsonwebtoken';

import AuthConfig, {JwtProcedure} from "../../../config/auth";
import {getWritableDirPath} from "../../../config/paths";

//--------------------------------------------------------------------

const data : {
    procedure: JwtProcedure,
    privateKey: string | Buffer | undefined,
    publicKey: string | Buffer | undefined,
    secret: string | undefined,
    options: {
        expiresIn: number,
        algorithm?: 'RS256' | 'HS256'
    },
    [key: string] : any
} = {
    procedure: AuthConfig.lap.jwtProcedure,
    privateKey: undefined,
    publicKey: undefined,
    secret: AuthConfig.lap.jwtSecret,
    options: {
        expiresIn: AuthConfig.lap.jwtMaxAge
    }
};

switch (data.procedure) {
    case 'RSA':
        data.privateKey = fs.readFileSync(getWritableDirPath()+'/'+AuthConfig.lap.jwtPrivateKey);
        data.publicKey = fs.readFileSync(getWritableDirPath()+'/'+AuthConfig.lap.jwtPublicKey);

        data.options.algorithm = 'RS256';

        break;
    case 'HMAC':
        data.options.algorithm = 'HS256';
        break;
}

export async function createToken(payload: object) {
    let token : string | undefined;

    switch (data.procedure) {
        case 'RSA':
            token = await sign(payload, data.privateKey, data.options)
            break;
        case 'HMAC':
            token = await sign(payload, data.secret, data.options)
            break;
    }

    return {token: token, expiresIn: data.options.expiresIn};
}

export async function verifyToken(token: string) {
    let payload;

    try {
        switch (data.procedure) {
            case 'RSA':
                payload = await verify(token, data.privateKey, {
                    algorithms: [data.options.algorithm]
                });
                break;
            case 'HMAC':
                payload = await verify(token, data.secret, {
                    algorithms: [data.options.algorithm]
                });
                break;
        }


    } catch (e) {
        return false;
    }

    return payload;
}

//--------------------------------------------------------------------
