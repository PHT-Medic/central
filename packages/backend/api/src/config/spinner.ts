/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import * as ora from 'ora';

let instance : ora.Ora | undefined;

export function useSpinner() {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = ora.default({
        spinner: 'dots',
    });

    return instance;
}
