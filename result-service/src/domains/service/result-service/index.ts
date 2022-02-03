export enum ResultServiceCommand {
    START = 'start',
    STOP = 'stop',
    DOWNLOAD = 'download',
    EXTRACT = 'extract',
    STATUS = 'status',
}

export type ResultServiceDataPayload = {
    train_id: string,
    id?: string,
};
