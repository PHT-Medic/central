import path from 'path';

let writableDirPath : string | undefined;

export function getWritableDirPath() {
    if(typeof writableDirPath !== 'undefined') {
        return writableDirPath;
    }

    writableDirPath = path.resolve(__dirname + '../../../writable');
    return writableDirPath;
}

let publicDirPath : string | undefined;

export function getPublicDirPath() {
    if(typeof publicDirPath !== 'undefined') {
        return publicDirPath;
    }

    publicDirPath = path.resolve(__dirname + '../../../public');
    return publicDirPath;
}
