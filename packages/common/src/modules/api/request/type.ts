/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type APIRequestRecord = {
    filter?: {
        [key: string] : any
    },
    fields?: {
        [key: string] : string[] | string
    } | string[] | string,
    sort?: {
        [key: string] : 'asc' | 'desc'
    },
    include?: string[],
    page?: {
        limit?: number,
        offset?: number
    }
}
