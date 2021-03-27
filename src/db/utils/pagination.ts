import {SelectQueryBuilder} from "typeorm";

export function applyRequestPagination(query: SelectQueryBuilder<any>, rawRequestPagination: unknown, maxLimit?: number) {
    let pagination: {
        limit?: number,
        offset?: number
    } = {};

    const prototype: string = Object.prototype.toString.call(rawRequestPagination);
    if (prototype === '[object Object]') {
        const rawPagination: Record<string, any> = <Record<string, any>>rawRequestPagination;

        if (rawPagination.hasOwnProperty('limit')) {
            const limit: unknown = parseInt(rawPagination.limit);

            if (!Number.isNaN(limit) && limit > 0) {
                pagination.limit = <number>limit;
            }
        }

        if (rawPagination.hasOwnProperty('offset')) {
            const offset: unknown = parseInt(rawPagination.offset);

            if (!Number.isNaN(offset) && offset >= 0) {
                pagination.offset = <number>offset;
            }
        }
    }

    if (typeof maxLimit !== 'undefined') {
        if (typeof pagination.limit === 'undefined' || pagination.limit > maxLimit) {
            pagination.limit = maxLimit;
        }
    }

    if (typeof pagination.limit !== 'undefined') {
        query.take(pagination.limit);

        if (typeof pagination.offset === 'undefined') {
            query.skip(0);
        }
    }

    if (typeof pagination.offset !== 'undefined') {
        query.skip(pagination.offset);
    }

    return pagination;
}
