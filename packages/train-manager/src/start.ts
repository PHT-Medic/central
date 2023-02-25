/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createConfig } from './config';

const config = createConfig();

function start() {
    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());
}

start();
