/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'minio';

export async function getMinioBucketObjectList(
    minio: Client,
    bucketName: string,
) : Promise<string[]> {
    const stream = await minio.listObjects(bucketName);
    const items : string[] = [];

    return new Promise<string[]>((resolve, reject) => {
        stream.on('data', (obj) => {
            items.push(obj.name);
        });

        stream.on('error', (e) => reject(e));

        stream.on('end', () => {
            resolve(items);
        });
    });
}
