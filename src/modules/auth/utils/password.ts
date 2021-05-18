import {compare, hash} from "bcrypt";

//--------------------------------------------------------------------

export async function hashPassword(password: string) {
    return hash(password,10);
}

export async function verifyPassword(password: string, hash: string) {
    return compare(password, hash);
}

//--------------------------------------------------------------------
