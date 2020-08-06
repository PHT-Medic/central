import fs from 'fs';
import { sign, verify } from 'jsonwebtoken';

import AuthProvider from "../authProvider";
import AuthConfig, {JWTKeyTypePrivateKey, JWTKeyTypeSecret} from "../../../../config/auth";
import {writablePath} from "../../../../config/paths";

//--------------------------------------------------------------------
const jwtMaxAge = AuthConfig.lap.jwtMaxAge;
let jwtKey = AuthConfig.lap.jwtKey;
let jwtOptions: any = {
    expiresIn: jwtMaxAge
}

switch (AuthConfig.lap.jwtKeyType) {
    case JWTKeyTypePrivateKey:
        jwtKey = fs.readFileSync(writablePath+AuthConfig.lap.jwtKey);
        jwtOptions = {
            algorithm: 'RS256'
        }
        break;
    case JWTKeyTypeSecret:
        jwtOptions = {
            algorithm: 'HS256'
        }
        break;
}

//--------------------------------------------------------------------

class TokenProvider extends AuthProvider {
    /**
     * Create token with payload.
     *
     * @param payload
     * @return {{expiresIn: (int|string), token: (undefined|*)}}
     */
    async createToken(payload: object) {
        const token = await sign(payload, jwtKey, jwtOptions);

        return {token: token, expiresIn: jwtMaxAge};
    }

    /**
     * Verify token.
     *
     * @param token
     * @return {boolean|*}
     */
    async verifyToken(token: string) {
        let payload;

        try {
            payload = await verify(token,jwtKey);
        } catch (e) {
            return false;
        }

        return payload;
    };
}

export default TokenProvider;
