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

export async function ensureMinioBucket(minio: Client, name: string) {
    const hasBucket = await minio.bucketExists(name);
    if (!hasBucket) {
        try {
            await minio.makeBucket(name, 'eu-west-1');
        } catch (e) {
            // ...
        }
    }
}
