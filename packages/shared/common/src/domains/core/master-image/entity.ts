/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface MasterImage {
    id: string;

    path: string | null;

    virtual_path: string;

    group_virtual_path: string;

    name: string;

    command: string | null;

    command_arguments: any | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
