/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import EventEmitter from 'events';

let instance : EventEmitter | undefined;

export function useLicenseAgreementEventEmitter() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = new EventEmitter();

    return instance;
}
