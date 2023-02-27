/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateTrainMinioBucketName } from '@personalhealthtrain/central-server-common';
import { useMinio } from '../../../../core';
import type { CoreConfigurePayload } from '../../type';

export async function executeCoreConfigureCommand(
    payload: CoreConfigurePayload,
) : Promise<CoreConfigurePayload> {
    const minio = useMinio();

    const bucketName = generateTrainMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (!hasBucket) {
        await minio.makeBucket(bucketName, 'eu-west-1');
    }

    return payload;
}
