/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AbilityManager } from '@authup/core';
import { setRequestEnv as setEnv, useRequestEnv as useEnv } from 'routup';
import type { Request } from 'routup';

type RequestEnv = {
    ability?: AbilityManager,

    realmId?: string,
    realmName?: string,
    // todo: set id?: string when authup >= 0.31.3
    realm?: { id: string, name?: string },

    userId?: string,
    userName?: string,

    robotId?: string,
    robotName?: string
};

export function useRequestEnv(req: Request) : RequestEnv;
export function useRequestEnv<T extends keyof RequestEnv>(req: Request, key: T) : RequestEnv[T];
export function useRequestEnv<T extends keyof RequestEnv>(req: Request, key?: T) {
    if (typeof key === 'string') {
        return useEnv(req, key) as RequestEnv[T];
    }

    return useEnv(req);
}

export function setRequestEnv<T extends keyof RequestEnv>(
    req: Request,
    key: T,
    value: RequestEnv[T],
) {
    return setEnv(req, key, value);
}
