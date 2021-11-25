/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type TokenPayload = {
    /**
     * owner id
     */
    sub: number | string,

    /**
     * issuer (api address)
     */
    iss: string,
    /**
     * remote address
     */
    remoteAddress: string
};
