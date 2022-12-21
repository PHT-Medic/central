/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import dotenv from 'dotenv';
import env from './env';
import createConfig from './config/module';

dotenv.config();

const config = createConfig({ env });

function start() {
    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());
}

start();
