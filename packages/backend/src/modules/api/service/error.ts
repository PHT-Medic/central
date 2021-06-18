export class APIServiceError extends Error {
    static connectionStringMissing(serviceName?: string) {
        const parts : string[] = ['The'];
        if(typeof serviceName === 'string') {
            parts.push(serviceName);
        }
        parts.push('connection string is not specified.');
        return new this(parts.join(' '));
    }

    static connectionStringInvalid(serviceName?: string) {
        const parts : string[] = ['The'];
        if(typeof serviceName === 'string') {
            parts.push(serviceName);
        }
        parts.push('connection string is not valid.');
        return new this(parts.join(' '));
    }
}
