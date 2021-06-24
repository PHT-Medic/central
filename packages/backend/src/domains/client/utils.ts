import {randomBytes} from "crypto";

export function createAuthClientSecret() {
    return randomBytes(40).toString('hex');
}
