/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import env from "./env";
import cron from 'node-cron';
import {getRepository} from "typeorm";
import {Train} from "@personalhealthtrain/ui-common";
import fs from "fs";
import path from "path";
import {getWritableDirPath} from "./config/paths";

export function initDemo() {
    if(!env.demo) return;

    const trainRepository = getRepository(Train);

    cron.schedule('* * 1 * * *', async () => {
        await trainRepository.createQueryBuilder('train')
            .delete()
            .execute();

        const directoryPath = path.resolve(getWritableDirPath() + '/train-files');

        const files = await fs.promises.readdir(directoryPath);
        for (const file of files) {
            await fs.promises.unlink(path.join(directoryPath, file));
        }
    })
}
