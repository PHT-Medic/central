/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ImageInfo } from 'dockerode';
import { useDocker } from './instance';

export async function checkIfLocalRegistryImageExists(repositoryTag: string) : Promise<boolean> {
    const docker = await useDocker();

    return new Promise<boolean>((resolve) => {
        docker.searchImages(
            { term: repositoryTag },
            (images: ImageInfo[]) => {
                if (images.length > 0) {
                    resolve(true);
                }

                resolve(false);
            },
        );
    });
}
