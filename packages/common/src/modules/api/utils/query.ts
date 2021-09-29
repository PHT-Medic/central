export function buildQuery(data?: any, expectQM?: boolean) {
    if (typeof data === 'undefined' || data === null) return '';

    // If the data is already a string, return it as-is
    if (typeof (data) === 'string') return data;

    // Create a query array to hold the key/value pairs
    let query = [];

    // Loop through the data object
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            let value = data[key];

            if (value && typeof value === 'object' && value.constructor === Array) {
                value = value.join(',');
            }

            if (value && typeof value === 'object' && value.constructor === Object) {
                for (let k in value) {
                    let v: any = value[k];

                    if (v && typeof v === 'object' && v.constructor === Array) {
                        v = v.join(',');
                    }

                    query.push(encodeURIComponent(key + '[' + k + ']') + '=' + encodeURIComponent(v));
                }

                continue;
            }

            // Encode each key and value, concatenate them into a string, and push them to the array
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }

    // Join each item in the array with a `&` and return the resulting string
    return (expectQM ? '' : '?') + query.join('&');
}
