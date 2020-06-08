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

    for(let key in requestFilters) {
        if(!requestFilters.hasOwnProperty(key)) {
            return;
        }

        if(Array.isArray(allowedFilters) && allowedFilters.indexOf(key) !== -1) {
            if(typeof requestFilters[key] === 'string') {
                let ids = requestFilters[key].split(',');
                query.whereIn(key,ids);
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
                query.whereIn(allowedFilters[key],ids);
            }
        }
    }

}

export default {
    onlyOneRow,
    applyRequestFilter
}

export {
    onlyOneRow,
    applyRequestFilter
}
