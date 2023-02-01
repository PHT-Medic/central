/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { downloadTemplate } from 'giget';
import { scanDirectory } from 'docker-scan';
import { Request, Response, sendAccepted } from 'routup';
import { getWritableDirPath } from '../../../../config';
import { mergeMasterImageGroupsWithDatabase, mergeMasterImagesWithDatabase } from './utils';

export async function syncMasterImages(req: Request, res: Response) : Promise<any> {
    const directoryPath: string = path.join(getWritableDirPath(), 'master-images.git');

    await downloadTemplate('github:PHT-Medic/master-images#master', {
        force: true,
        dir: 'master-images.git',
        cwd: getWritableDirPath(),
    });

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
