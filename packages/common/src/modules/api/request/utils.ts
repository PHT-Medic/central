/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildQuery} from "./query";
import {APIRequestRecord} from "./type";

export function formatAPIRequestRecord(record?: APIRequestRecord) : string {
    if(typeof record === 'undefined' || record === null) return '';

    let output : {[key: string] : any} = {};

    let keys : string[] = ['filter', 'sort', 'include', 'page', 'fields'];
    for(let i=0; i<keys.length; i++) {
        if(record.hasOwnProperty(keys[i])) {
            // @ts-ignore
            output[keys[i]] = record[keys[i]];
        }
    }

    if(typeof record.filter !== 'undefined') {
        output.filter = record.filter;
    }

    if(typeof record.fields !== 'undefined') {
        output.fields = record.fields;
    }

    if(typeof record.page !== 'undefined') {
        output.page = record.page;
    }

    if(typeof record.sort !== 'undefined') {
        let sort : string[] = [];

        for(let key in record.sort) {
            const direction : string = record.sort[key] === 'desc' ? '-' : '';
            sort.push(direction + key);
        }

        output.sort = sort;
    }

    return buildQuery(output);
}
