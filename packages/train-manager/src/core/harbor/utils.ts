/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HarborClient } from '@hapic/harbor';
import { createClient } from '@hapic/harbor';

export function createBasicHarborAPIClient(connectionString: string) : HarborClient {
    return createClient({
        connectionString,
    });
}
