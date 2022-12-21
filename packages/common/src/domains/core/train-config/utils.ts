/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TrainConfig, TrainConfigRouteItem } from './type';
import { hasOwnProperty } from '../../../utils';

export function isTrainConfigRoute(value: unknown) : value is TrainConfigRouteItem {
    if (typeof value !== 'object') {
        return false;
    }

    if (
        !hasOwnProperty(value, 'index') ||
        typeof value.index !== 'number' ||
        value.index < 0
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'station') ||
        typeof value.station !== 'string'
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'eco_system') ||
        typeof value.eco_system !== 'string'
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'rsa_public_key') ||
        typeof value.rsa_public_key !== 'string'
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'signature')
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'encrypted_key')
    ) {
        return false;
    }

    return true;
}

export function isTrainConfig(value: unknown) : value is TrainConfig {
    if (typeof value !== 'object') {
        return false;
    }

    if (
        hasOwnProperty(value, 'route') &&
        Array.isArray(value.route)
    ) {
        const items = value.route.filter((item) => isTrainConfigRoute(item));

        if (items.length !== value.route.length) {
            return false;
        }
    } else {
        return false;
    }

    if (
        !hasOwnProperty(value, 'file_list') ||
        !Array.isArray(value.file_list)
    ) {
        return false;
    }

    const items = value.file_list.filter((item) => typeof item === 'string');

    if (items.length !== value.file_list.length) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'hash') ||
        typeof value.hash !== 'string'
    ) {
        return false;
    }

    if (
        !hasOwnProperty(value, 'signature') ||
        typeof value.signature !== 'string'
    ) {
        return false;
    }

    return true;
}
