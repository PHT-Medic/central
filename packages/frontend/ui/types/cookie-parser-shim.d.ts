/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

declare module 'cookieparser' {
    export let maxLength: number;
    export function parse(cookie: string) : {[key: string]: string };
}
