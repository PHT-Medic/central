export type HarborConnectionConfig = {
    host: string,
    user: string,
    password: string,
    token: string
};

export function parseHarborConnectionString(connectionString: string): HarborConnectionConfig {
    const parts: string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new Error('Harbor connection string must be in the following format: user:password@host');
    }

    const host: string = parts[1];

    const authParts: string[] = parts[0].split(':');
    if (authParts.length !== 2) {
        throw new Error('Harbor connection string must be in the following format: user:password@host');
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
        token: Buffer.from(`${authParts[0]}:${authParts[1]}`).toString('base64'),
    };
}
