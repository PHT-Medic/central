/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import tar, { Pack } from 'tar-stream';

export function createPackFromFileContent(
    content: string,
    fileName: string,
) : Pack {
    const pack = tar.pack();
    const entry = pack.entry({
        name: fileName,
        type: 'file',
        size: content.length,
    }, (err) => {
        if (err) {
            pack.destroy(err);
        }

        pack.finalize();
    });

    entry.write(content);
    entry.end();

    return pack;
}
