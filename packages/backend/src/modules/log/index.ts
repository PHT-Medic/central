/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Logger, createLogger, format, transports,
} from 'winston';
import { getWritableDirPath } from '../../config/paths';

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
    if (typeof info.meta?.namespace === 'string') {
        info.message = `${info.namespace}: ${info.message}`;
    }

    return info;
});

export function useLogger() : Logger {
    if (typeof logger !== 'undefined') {
        return logger;
    }

    logger = createLogger({
        format: format.combine(
            includeNamespaceInMessage(),
            format.colorize(),
            format.json(),
            format.timestamp(),
        ),
        level: 'debug',
        transports: [
            new transports.Console({
                level: 'debug',
            }),
            new transports.File({
                filename: `${getWritableDirPath()}/error.log`,
                level: 'warn',
            }),
        ],
    });

    return logger;
}
