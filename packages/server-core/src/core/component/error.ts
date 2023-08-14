/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError } from '@ebec/http';

export class ComponentError extends BaseError {
    public getStep(): string {
        return this.getOption('step');
    }

    public getCode(): string {
        return `${this.getOption('code')}`;
    }
}
