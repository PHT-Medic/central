/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Stream } from 'stream';

export async function streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise <Buffer>((resolve, reject) => {
        const parts : Buffer[] = [];

        stream.on('data', (chunk) => parts.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(parts)));
        stream.on('error', (err) => reject(err));
    });
}
