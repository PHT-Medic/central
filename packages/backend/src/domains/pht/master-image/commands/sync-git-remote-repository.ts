/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from "fs";
import {clone, pull} from "isomorphic-git";
import http from "isomorphic-git/http/node";
import {MaterImagesGitSyncContext} from "./type";

export async function syncMasterImageGitRepository(context: MaterImagesGitSyncContext) : Promise<any> {
    try {
        await fs.promises.access(context.directoryPath, fs.constants.R_OK | fs.constants.W_OK);
        await pull({
            fs,
            http,
            dir: context.directoryPath
        })
    } catch (e) {
        await clone({
            fs,
            http,
            url: context.gitURL,
            dir: context.directoryPath
        })
    }
}
