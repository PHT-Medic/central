import path from "path";
import fs from 'fs';
import { sign, verify } from 'jsonwebtoken';
import { generateKeyPairSync } from "crypto";
import {getRootDirPath, getWritableDirPath} from "../../../config/paths";
import env from "../../../env";

type Procedure = {
    algorithm: 'RS256' | 'HS256',
    privateKey: string,
    publicKey?: string,
    maxAge: number
}

export function getProcedureConfiguration() : Promise<Procedure> {
    return new Promise(((resolve) => {
        const mode : string = env.jwtProcedure;

        let procedure : Partial<Procedure> = {
            maxAge: 60 * 60 * 24
        };

        let maxAge : number = parseInt(env.jwtMaxAge)
        if(!Number.isNaN(maxAge)) {
            procedure.maxAge = maxAge;
        }

        switch (mode) {
            case 'RSA':
                procedure.algorithm = "RS256";

                let privateKeyPath : string | undefined;
                let publicKeyPath : string | undefined;

                if(env.jwtPrivateKey) {
                    privateKeyPath = path.resolve(getRootDirPath(), env.jwtPrivateKey);
                } else {
                    privateKeyPath = path.resolve(getWritableDirPath(), 'private.key');
                }

                if(env.jwtPublicKey) {
                    publicKeyPath = path.resolve(getRootDirPath(), env.jwtPublicKey);
                } else {
                    publicKeyPath = path.resolve(getRootDirPath(), 'public.key');
                }

                if(fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
                    procedure.privateKey = fs.readFileSync(privateKeyPath).toString();
                    procedure.publicKey = fs.readFileSync(publicKeyPath).toString();

                    return resolve(<Procedure> procedure);
                } else {
                    let { privateKey, publicKey } = generateKeyPairSync('rsa', {
                        modulusLength: 2048,
                    });

                    const privateKeyString = privateKey.export({format: "pem", type: "pkcs8"}).toString();
                    const publicKeyString = publicKey.export({format: "pem", type: "spki"}).toString();

                    fs.writeFileSync(privateKeyPath, privateKeyString);
                    fs.writeFileSync(publicKeyPath, publicKeyString);

                    return resolve(<Procedure> {
                        privateKey: privateKeyString,
                        publicKey: publicKeyString,
                        ...procedure
                    });
                }

                break;
            // HMAC
            default:
                procedure.privateKey = env.jwtSecret;
                procedure.algorithm = "HS256";

                return resolve(<Procedure> procedure);
        }
    }))
}

export async function createToken(payload: object) {
    const procedure = await getProcedureConfiguration();

    const token : string = await sign(payload, procedure.privateKey, {
        expiresIn: procedure.maxAge,
        algorithm: procedure.algorithm,
    })

    return {
        token: token,
        expiresIn: procedure.maxAge
    };
}

export async function verifyToken(token: string) : Promise<Record<string, any>> {
    const procedure = await getProcedureConfiguration();

    return <Record<string, any>> verify(token, procedure.publicKey, {
        algorithms: [procedure.algorithm]
    });
}
