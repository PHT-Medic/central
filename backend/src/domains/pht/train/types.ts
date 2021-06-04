
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
