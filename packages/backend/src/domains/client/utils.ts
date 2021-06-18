import {randomBytes} from "crypto";

export function createAuthClientSecret() {
    return randomBytes(100).toString('hex');
}
