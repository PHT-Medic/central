import { sign, verify } from 'jsonwebtoken';
import {compare, hash} from "bcrypt";

//--------------------------------------------------------------------

const jwtKey = process.env.JWT_KEY;
const jwtMaxAge = 3600 * 24;

//--------------------------------------------------------------------

/**
 * Create token with payload.
 *
 * @param payload
 * @return {{expiresIn: (int|string), token: (undefined|*)}}
 */
const createToken = async (payload: object) => {
    const token = await sign(payload, jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtMaxAge
    });

    return {token: token, expiresIn: jwtMaxAge};
};

/**
 * Verify token.
 *
 * @param token
 * @return {boolean|*}
 */
const verifyToken = async (token: string) => {
    let payload;

    try {
        payload = await verify(token,jwtKey);
    } catch (e) {
        return false;
    }

    return payload;
};

//--------------------------------------------------------------------

const hashPassword = async (password: string) => {
    return hash(password,10);
};

const verifyPassword = async (password: string, hash: string) => {
    return compare(password, hash);
};

//--------------------------------------------------------------------

export {
    createToken,
    verifyToken,
    hashPassword,
    verifyPassword
}

export default {
    createToken,
    verifyToken,
    hashPassword,
    verifyPassword
}
