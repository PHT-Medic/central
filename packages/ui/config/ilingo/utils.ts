/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ValidationTranslator } from '@vue-layout/utils';
import { Ilingo } from 'ilingo';

export function buildVuelidateTranslator(translator: Ilingo, locale?: string) : ValidationTranslator {
    return function translate(validator: string, parameters?: Record<string, any>) : string | undefined {
        return translator.getSync(`validation.${validator}`, parameters, locale);
    };
}
