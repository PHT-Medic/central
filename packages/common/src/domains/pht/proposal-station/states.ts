
/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
