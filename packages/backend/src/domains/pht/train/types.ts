
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
    DETECT_BUILD_STATUS = 'detectBuildStatus',
    DETECT_RUN_STATUS = 'detectRunStatus',
    GENERATE_HASH = 'generateHash',
    START = 'start',
    STOP = 'stop',
    TRIGGER_DOWNLOAD = 'triggerDownload'
}
