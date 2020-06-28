/**
 *
 *
 * @param data
 * @param mapping (appKey -> pseudoKey)
 */

const formatToEdgeRequestObject = (data, mapping) => {
    let item = {};

    for(let dataKey in data) {
        if(!data.hasOwnProperty(dataKey)) {
            continue;
        }

        if(!mapping.hasOwnProperty(dataKey)) {
            continue;
        }

        item[mapping[dataKey]] = data[dataKey];
    }

    return item;
}

/**
 *
 *
 * @param data
 * @param mapping (appKey -> pseudoKey)
 */
const parseEdgeResponseObject = (data, mapping) => {
    let item = {};

    for(let mappingKey in mapping) {
        if(!mapping.hasOwnProperty(mappingKey)) {
            continue;
        }

        let mappingValue = mapping[mappingKey];

        if(!data.hasOwnProperty(mappingValue)) {
            continue;
        }

        item[mappingKey] = data[mappingValue];
    }

    return item;
}

const parseEdgeResponseObjects = (data, mapping) => {
    for (let i=0; i<data.length; i++) {
        data[i] = parseEdgeResponseObject(data[i],mapping);
    }

    return data;
}

export default {
    parseEdgeResponseObject,
    parseEdgeResponseObjects,
    formatToEdgeRequestObject
}

export {
    parseEdgeResponseObject,
    parseEdgeResponseObjects,
    formatToEdgeRequestObject
}
