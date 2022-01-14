/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HarborRepository = {
    id: number | string,
    name: string,
    fullName: string,
    artifactCount?: number,
    projectId: number,
    projectName: string,
    createdAt?: string,
    updatedAt?: string
};
