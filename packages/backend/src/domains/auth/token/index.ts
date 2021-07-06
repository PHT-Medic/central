import {TokenPayload} from "./type";
import env from "../../../env";

/**
 *
 * @param data
 * @param expiresIn (seconds)
 */
export function buildTokenPayload(data: Pick<TokenPayload, 'remoteAddress' | 'sub'>, expiresIn: number) : TokenPayload {
    return {
        ...data,
        iss: env.apiUrl
    }
}
