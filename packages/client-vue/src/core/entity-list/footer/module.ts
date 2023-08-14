/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PaginationMeta } from '@vue-layout/pagination';
import { buildPagination } from '@vue-layout/pagination';
import { unref } from 'vue';
import type { EntityListFooterPaginationOptions } from './type';

export function buildEntityListFooterPagination(
    ctx: EntityListFooterPaginationOptions,
) {
    return buildPagination({
        load: ctx.load as (meta: PaginationMeta) => any,
        total: ctx.meta?.value.total || 0,
        limit: ctx.meta?.value.limit || 0,
        offset: ctx.meta?.value.offset || 0,
        busy: unref(ctx.busy),
    });
}
