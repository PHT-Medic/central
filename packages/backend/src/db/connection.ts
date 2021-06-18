import {ConnectionOptions, getConnectionOptions} from "typeorm";

export async function createTypeOrmConnectionOptions() :  Promise<ConnectionOptions> {
    const connectionOptions = await getConnectionOptions();
    let isTsNode = false;

    try {
        // @ts-ignore
        if (process[Symbol.for("ts-node.register.instance")]) {
            isTsNode = true;
        }
    } finally {
        if (isTsNode) {
            Object.assign(connectionOptions, {
                'entities': ['src/db/entities.ts'],
                'subscribers': ['src/db/subscribers.ts']
            } as ConnectionOptions);
        } else {
            Object.assign(connectionOptions, {
                'entities': ['dist/db/entities.ts'],
                'subscribers': ['dist/db/subscribers.ts']
            } as ConnectionOptions);
        }
    }

    return connectionOptions;
}
