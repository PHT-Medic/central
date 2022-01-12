/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface MasterImageGroup {
    id: string;

    name: string;

    path: string;

    virtual_path: string;

    command: string | null;

    command_arguments: any | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
