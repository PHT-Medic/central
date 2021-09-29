export type TrainTypeAnalyse = 'analyse';
export type TrainTypeDiscovery = 'discovery';

export type TrainType = TrainTypeAnalyse |
    TrainTypeDiscovery;

export function isTrainType(type: string) : type is TrainType {
    switch (type) {
        case "analyse":
        case "discovery":
            return true;
        default:
            return false;
    }
}

export enum TrainCommand {
    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    RUN_START = 'runStart',
    RUN_STOP = 'runStop',
    RUN_STATUS = 'runStatus',

    RESULT_STATUS = 'resultStatus',
    RESULT_START = 'resultStart',
    RESULT_STOP = 'resultStop',

    GENERATE_HASH = 'generateHash',

}
