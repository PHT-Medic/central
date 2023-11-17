/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { Logger, LoggerOptions } from 'winston';
import { createLogger, format, transports } from 'winston';
import { useEnv } from '../env';

import { getWritableDirPath } from '../paths';

let logger : undefined | any;

/*
Levels
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
 */

const includeNamespaceInMessage = format((info) => {
    if (info.meta?.namespace) {
        info.message = `${info.namespace}: ${info.message}`;
    }

    return info;
});

export function useLogger() : Logger {
    if (typeof logger !== 'undefined') {
        return logger;
    }

    let items : LoggerOptions['transports'];

    if (useEnv('env') === 'production') {
        items = [
            new transports.Console({
                level: 'info',
            }),
            new transports.File({
                filename: path.join(getWritableDirPath(), 'access.log'),
                level: 'http',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
            new transports.File({
                filename: path.join(getWritableDirPath(), 'error.log'),
                level: 'warn',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
        ];
    } else {
        items = [
            new transports.Console({
                level: 'debug',
            }),
        ];
    }

    logger = createLogger({
        format: format.combine(
            includeNamespaceInMessage(),
            format.json(),
            format.timestamp(),
        ),
        transports: items,
    });

    return logger;
}
