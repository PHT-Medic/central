import path from 'path';

const writablePath = path.resolve(__dirname + '../../../writable');
export {
    writablePath
}

export default {
    writablePath
}

let publicDirPath : string | undefined;

export function getPublicDirPath() {
    if(typeof publicDirPath !== 'undefined') {
        return publicDirPath;
    }

    publicDirPath = path.resolve(__dirname + '../../../public');
    return publicDirPath;
}
