export const TrainStationStateOpen : TrainStationState = 'open';
export const TrainStationStateRejected : TrainStationState = 'rejected';
export const TrainStationStateApproved : TrainStationState = 'approved';

export type TrainStationState = 'open' | 'rejected' | 'approved';

export function isTrainStationState(type: string) : type is TrainStationState {
    switch (type) {
        case "open":
        case "approved":
        case "rejected":
            return true;
        default:
            return false;
    }
}
