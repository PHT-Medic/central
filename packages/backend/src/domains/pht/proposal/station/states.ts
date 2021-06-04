
export const ProposalStationStateOpen = 'open';
export const ProposalStationStateRejected = 'rejected';
export const ProposalStationStateApproved = 'approved';

export type ProposalStationState = 'open' |
    'rejected' |
    'approved';

export function isProposalStationState(type: string) : type is ProposalStationState {
    switch (type) {
        case "open":
        case "approved":
        case "rejected":
            return true;
        default:
            return false;
    }
}
