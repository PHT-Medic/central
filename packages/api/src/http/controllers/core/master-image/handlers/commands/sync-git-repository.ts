/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import rimraf from 'rimraf';
import path from 'path';
import fs from 'fs';
import { clone } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { scanDirectory } from 'docker-scan';
import { Request, Response, sendAccepted } from 'routup';
import { getWritableDirPath } from '../../../../../../config';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

export async function syncGitRepository(req: Request, res: Response) : Promise<any> {
    const gitURL = 'https://github.com/PHT-Medic/master-images';
    const directoryPath: string = path.join(getWritableDirPath(), 'master-images.git');

    try {
        await fs.promises.access(directoryPath);
        await rimraf.sync(directoryPath);
    } catch (e) {
        // ...
    }

    try {
        await fs.promises.access(directoryPath);
        await fs.promises.unlink(directoryPath);
    } catch (e) {
        // ...
    }

    await clone({
        fs,
        http,
        url: gitURL,
        dir: directoryPath,
        ref: 'master',
    });

    /*
    todo: use this again when forced merge is possible to encounter merge conflicts

    await pull({
        fs,
        http,
        dir: directoryPath,
        ref: 'master',
        author: {
            name: 'ui',
        },
    });
     */

    const data = await scanDirectory(directoryPath);

    // languages
    const groups = await mergeMasterImageGroupsWithDatabase(data.groups);

    // images
    const images = await mergeMasterImagesWithDatabase(data.images);

    return sendAccepted(res, {
        groups,
        images,
    });
}
