/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createClient } from 'hapic';
import tar from 'tar';
import { scanDirectory } from 'docker-scan';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { getWritableDirPath } from '../../../config';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

export async function syncMasterImages(req: Request, res: Response) : Promise<any> {
    const directoryPath: string = path.join(getWritableDirPath(), 'master-images');

    await fs.promises.rm(directoryPath, { force: true, recursive: true });
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const client = createClient();
    const response = await client.get(
        'https://github.com/PHT-Medic/master-images/archive/master.tar.gz',
        {
            responseType: 'stream',
        },
    );

    const tarPath = path.join(getWritableDirPath(), 'master-images.tar.gz');
    const writable = fs.createWriteStream(tarPath);

    writable.on('error', () => {
        res.statusCode = 400;
        res.end();
    });

    writable.on('finish', async () => {
        await tar.extract({
            file: tarPath,
            cwd: directoryPath,
            onentry(entry) {
                entry.path = entry.path.split('/').splice(1).join('/');
            },
        });

        const data = await scanDirectory(directoryPath);

        // languages
        const groups = await mergeMasterImageGroupsWithDatabase(data.groups);

        // images
        const images = await mergeMasterImagesWithDatabase(data.images);

        sendAccepted(res, {
            groups,
            images,
        });
    });

    const readStream = Readable.fromWeb(response.data as any);
    readStream.pipe(writable);
}
