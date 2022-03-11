/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDocker } from './instance';

export async function removeLocalRegistryImage(image: string) {
    await useDocker()
        .getImage(image)
        .remove();
}
