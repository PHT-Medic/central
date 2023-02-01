/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';

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
