import {useTrainBuilderSocket} from "../../socket/provider/train-builder";

export function generateTrainHash(message: Record<string, any>, userToken: string) : Promise<string> {
    return new Promise(((resolve, reject) => {
        const socket = useTrainBuilderSocket();

        try {
            return socket.emit('train', {
                action: 'generateHash',
                data: message,
                token: userToken,
            }, (data: any) => {
                if (
                    typeof data === 'object' &&
                    data.hasOwnProperty('success') &&
                    data.success
                ) {
                    let {hash} = data.data;

                    if (hash instanceof Buffer) {
                        hash = hash.toString('UTF-8');
                    }

                    if (typeof hash === 'string') {
                        return resolve(hash);
                    } else {
                        return reject(new Error('Der generierte Hash ist ungültig.'));
                    }
                } else {
                    return reject(new Error('Der Hash konnte nicht generiert werden.'));
                }
            });
        } catch (e) {
            return reject(e);
        }
    }));
}

export function startTrain(message: Record<string, any>, userToken: string) : Promise<any> {
    return new Promise(((resolve, reject) => {
        const socket = useTrainBuilderSocket();

        try {
            return socket.emit('train', {
                action: 'generateHash',
                data: message,
                token: userToken,
            }, (data: any) => {
                let success = false;

                if(typeof data === 'object') {
                    success = typeof data.success === 'boolean' ? data.success : false;
                }

                if(success) {
                    return resolve();
                } else {
                    return reject(new Error('Der Zug konnte nicht gestartet werden.'));
                }
            });
        } catch (e) {
            return reject(e);
        }
    }));
}
