/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    PermissionID,
    ProposalStationApprovalCommand,
    ProposalStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import Vue, { PropType } from 'vue';
import { renderActionCommand } from '../../render/utils';
import { ActionCommandMethods, ActionCommandProperties } from '../../render/type';

type ProposalStationActionProperties = {
    entityId: string,
    approvalStatus: ProposalStationApprovalStatus
    command: `${ProposalStationApprovalCommand}`
} & ActionCommandProperties;

export default Vue.extend<any, ActionCommandMethods, any, ProposalStationActionProperties>({
    name: 'ProposalStationApprovalCommand',
    props: {
        entityId: String,
        approvalStatus: String as PropType<ProposalStationApprovalStatus>,

        command: String as PropType<ProposalStationApprovalCommand>,
        elementType: {
            type: String as PropType<ActionCommandProperties['elementType']>,
            default: 'button',
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
        withText: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        commandText() {
            switch (this.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'approve';
                case ProposalStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case ProposalStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        },
        classSuffix() {
            switch (this.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'success';
                case ProposalStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        },
        isAllowed() {
            return this.$auth.has(PermissionID.PROPOSAL_APPROVE);
        },
        isDisabled() {
            if (
                this.approvalStatus &&
                this.approvalStatus === ProposalStationApprovalStatus.APPROVED &&
                this.command === ProposalStationApprovalCommand.APPROVE
            ) {
                return true;
            }

            return this.approvalStatus &&
                this.approvalStatus === ProposalStationApprovalStatus.REJECTED &&
                this.command === ProposalStationApprovalCommand.REJECT;
        },
    },
    methods: {
        async do() {
            if (this.busy) return;

            this.busy = true;

            let status;

            switch (this.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    status = ProposalStationApprovalStatus.APPROVED;
                    break;
                case ProposalStationApprovalCommand.REJECT:
                    status = ProposalStationApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await this.$api.proposalStation.update(this.entityId, {
                    approval_status: status,
                });

                this.$emit('updated', item);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
    render(createElement) {
        return renderActionCommand(this, createElement);
    },
});
