/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { Logger } from 'winston';
import { createLogger, format, transports } from 'winston';
import { getWritableDirPath } from '../../../config';
import { ComponentName } from '../../constants';

let instance : Logger | undefined;

export function useCoreLogger() : Logger {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = createLogger({
        format: format.json(),
        defaultMeta: {
            component: ComponentName.CORE,
        },
        level: 'debug',
        transports: [
            new transports.Console({
                level: 'debug',
            }),
            new transports.File({
                filename: path.join(getWritableDirPath(), 'error.log'),
                level: 'warn',
            }),
        ],
    });

    return instance;
}
