/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError, createExtractOptionsFn } from '@ebec/http/core';
import { isObject } from '@personalhealthtrain/core';
import type { ComponentErrorInput, ComponentErrorOptions } from './type';

export function isOptions(input: unknown) : input is ComponentErrorOptions {
    if (!isObject(input)) {
        return false;
    }

    if (
        typeof input.step !== 'undefined' &&
        typeof input.step !== 'number' &&
        typeof input.step !== 'string'
    ) {
        return false;
    }

    if (
        typeof input.type !== 'undefined' &&
        typeof input.type !== 'string'
    ) {
        return false;
    }

    return typeof input.command === 'undefined' ||
        typeof input.command === 'string';
}

const check = createExtractOptionsFn(isOptions);
export function extractComponentErrorOptions(...input: ComponentErrorInput[]) {
    return check(...input);
}

export class ComponentError extends BaseError {
    step: string | undefined;

    type: string | undefined;

    command: string;

    constructor(...input: ComponentErrorInput[]) {
        super(...input);

        const options = extractComponentErrorOptions(...input);

        this.step = options.step;
        this.type = options.type;
        this.command = options.command;
    }
}
