export function clearObjectProperties(obj: {[key: string] : any}) {
    for (let propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }

        if(obj[propName] === '') {
            obj[propName] = null;
        }
    }

    return obj;
}
