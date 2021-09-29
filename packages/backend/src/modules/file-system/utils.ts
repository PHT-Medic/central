/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from "fs";

export async function ensureDirectoryExists(path: string) {
    try {
        await fs.promises.stat(path);
        await fs.promises.chmod(path, 0o775);
    } catch (e) {
        await fs.promises.mkdir(path, {
            mode: 0o775
        });
    }
}
