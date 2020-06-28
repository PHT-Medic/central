import {type} from "os";

const onlyOneRow = (db: Promise<any>) => {
    return db.then(data => {
        if(!data) {
            throw new Error('Couldn\'t find data set.');
        }

        if(Array.isArray(data)) {
            return data[0];
        }

        if(typeof data === 'object') {
            return data;
        }

        throw new Error('Couldn\'t find data set.');
    });
}

const applyRequestFilter = (query: any, requestFilters: any, allowedFilters: string[] | object) => {
    if(!requestFilters || typeof requestFilters !== 'object') {
        return;
    }

    return query.andWhere(function () {
        for(let key in requestFilters) {
            if(!requestFilters.hasOwnProperty(key)) {
                return;
            }

            if(Array.isArray(allowedFilters) && allowedFilters.indexOf(key) !== -1) {
                if(typeof requestFilters[key] === 'string') {
                    let ids = requestFilters[key].split(',');
                    this.whereIn(key,ids);
                }

                continue;
            }

            if(typeof allowedFilters === 'object' && Object.keys(allowedFilters).indexOf(key) !== -1) {
                if(!allowedFilters.hasOwnProperty(key)) continue;

                if(
                    typeof requestFilters[key] === 'string'
                ) {
                    let ids = requestFilters[key].split(',');
                    // @ts-ignore
                    this.whereIn(allowedFilters[key],ids);
                }
            }
        }

        return this;
    });
}

export default {
    onlyOneRow,
    applyRequestFilter
}

export {
    onlyOneRow,
    applyRequestFilter
}
