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

export function getImageOutputDirectoryPath() {
    return path.join(getWritableDirPath(), 'train-results');
}

export function buildImageOutputFilePath(id: string) {
    return path.join(getImageOutputDirectoryPath(), `${path.basename(id, '.tar')}.tar`);
}
