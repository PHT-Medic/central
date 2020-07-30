import { sign, verify } from 'jsonwebtoken';

import AuthProvider from "../authProvider";

//--------------------------------------------------------------------

const jwtKey = process.env.JWT_KEY;
const jwtMaxAge = 3600 * 24 * 31;

//--------------------------------------------------------------------

class TokenProvider extends AuthProvider {
    /**
     * Create token with payload.
     *
     * @param payload
     * @return {{expiresIn: (int|string), token: (undefined|*)}}
     */
    async createToken(payload: object) {
        const token = await sign(payload, jwtKey, {
            algorithm: 'HS256',
            expiresIn: jwtMaxAge
        });

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
