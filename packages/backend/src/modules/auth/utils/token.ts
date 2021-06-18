import { sign, verify } from 'jsonwebtoken';
import {SecurityKeyPair, useSecurityKeyPair} from "../security";

export async function createToken(payload: Record<string, any>, maxAge: number = 3600) {
    const keyPair : SecurityKeyPair = useSecurityKeyPair();

    const token : string = await sign(payload, keyPair.privateKey, {
        expiresIn: maxAge,
        algorithm: 'RS256',
    })

    return {
        token,
        expiresIn: maxAge
    };
}

export async function verifyToken(token: string) : Promise<Record<string, any>> {
    const keyPair : SecurityKeyPair = useSecurityKeyPair();

    return (await verify(token, keyPair.publicKey, {
        algorithms: ['RS256']
    }) as Record<string, any>);
}
