/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HarborProject = {
    name: string,
    id: number,
    [key: string]: any
};
export type HarborProjectCreateContext = {
    project_name: string,
    public?: boolean,
    registry_id?: string | number | null,
    storage_limit?: number
};
