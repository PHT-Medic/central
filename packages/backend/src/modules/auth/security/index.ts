import {generateKeyPairSync} from "crypto";
import * as fs from "fs";
import path from "path";
import {getWritableDirPath} from "../../../config/paths";

export interface SecurityKeyPair {
    privateKey: string,
    publicKey: string
}

function getSecurityKeyFilePath(type: 'private' | 'public') {
    return path.resolve(getWritableDirPath(), type + '.key');
}

let keyPairCache : SecurityKeyPair | undefined;

export function createSecurityKeyPair() : SecurityKeyPair {
    if(typeof keyPairCache !== 'undefined') {
        return keyPairCache;
    }

    const {privateKey, publicKey} = generateKeyPairSync('rsa', {
        modulusLength: 2048
    });

    const privateKeyString = privateKey.export({format: "pem", type: "pkcs8"}).toString();
    const publicKeyString = publicKey.export({format: "pem", type: "spki"}).toString();

    fs.writeFileSync(getSecurityKeyFilePath('private'), privateKeyString);
    fs.writeFileSync(getSecurityKeyFilePath('public'), publicKeyString);

    keyPairCache = {
        privateKey: privateKeyString,
        publicKey: publicKeyString
    }

    return {
        privateKey: privateKeyString,
        publicKey: publicKeyString
    }
}

export function useSecurityKeyPair() : SecurityKeyPair {
    if(typeof keyPairCache !== 'undefined') {
        return keyPairCache;
    }

    const privateKeyPath : string = getSecurityKeyFilePath('private');
    const publicKeyPath : string = getSecurityKeyFilePath('public');

    if(!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
        return createSecurityKeyPair()
    }

    return {
        privateKey: fs.readFileSync(privateKeyPath).toString(),
        publicKey: fs.readFileSync(publicKeyPath).toString()
    }
}
