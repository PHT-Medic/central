/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { camelCase } from 'change-case';

export interface AbilityRepresentation {
    action: string,
    subject: string
}

export function parsePermissionNameToAbilityRepresentation(name: string) : AbilityRepresentation {
    const parts : string[] = name.split('_');
    const action : string | undefined = parts.pop();
    const subject : string = camelCase(parts.join('_'));

    if (typeof action === 'undefined') {
        throw new Error('Permission name not valid.');
    }

    return {
        action,
        subject,
    };
}
