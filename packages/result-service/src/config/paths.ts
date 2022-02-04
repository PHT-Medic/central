import path from 'path';

let writableDirPath : string | undefined;
let rootDirPath : string | undefined;

export function getWritableDirPath() {
    if (typeof writableDirPath !== 'undefined') {
        return writableDirPath;
    }

    writableDirPath = path.resolve(`${__dirname}../../../writable`);
    return writableDirPath;
}

export function getRootDirPath() {
    if (typeof rootDirPath !== 'undefined') {
        return rootDirPath;
    }

    rootDirPath = path.resolve(`${__dirname}../../../`);
    return rootDirPath;
}

export function getTrainResultDirectoryPath() {
    return path.join(getWritableDirPath(), 'train-results');
}

export function buildTrainResultFilePath(trainResultId: string) {
    return path.join(getTrainResultDirectoryPath(), `${path.basename(trainResultId, '.tar')}.tar`);
}
