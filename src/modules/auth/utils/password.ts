import {compare, hash} from "bcrypt";

//--------------------------------------------------------------------

const hashPassword = async (password: string) => {
    return hash(password,10);
};

const verifyPassword = async (password: string, hash: string) => {
    return compare(password, hash);
};

//--------------------------------------------------------------------

export {
    hashPassword,
    verifyPassword
}

export default {
    hashPassword,
    verifyPassword
}
