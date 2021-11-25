/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ProposalStationApprovalStatus {
    REJECTED = 'rejected',
    APPROVED = 'approved'
}

export type ProposalStationApprovalStatusType = `${ProposalStationApprovalStatus}`;

const ProposalStationApprovalStatusValues = Object.values(ProposalStationApprovalStatus);
export function isProposalStationApprovalStatus(type: any) : type is ProposalStationApprovalStatusType {
    return ProposalStationApprovalStatusValues.indexOf(type) !== -1;
}
