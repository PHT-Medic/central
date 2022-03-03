/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    PermissionID, TrainStationApprovalCommand,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/central-common';
import Vue, { PropType } from 'vue';
import { renderActionCommand } from '../../render/utils';
import { ActionCommandMethods, ActionCommandProperties } from '../../render/type';

type TrainStationActionProperties = {
    entityId: string,
    approvalStatus: TrainStationApprovalStatus
    command: `${TrainStationApprovalCommand}`
} & ActionCommandProperties;

export default Vue.extend<any, ActionCommandMethods, any, TrainStationActionProperties>({
    name: 'TrainStationCommand',
    props: {
        entityId: String,
        approvalStatus: String as PropType<TrainStationApprovalStatus>,

        command: String as PropType<TrainStationApprovalCommand>,
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
                case TrainStationApprovalCommand.APPROVE:
                    return 'approve';
                case TrainStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case TrainStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'success';
                case TrainStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        },
        isAllowed() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_APPROVE);
        },
        isDisabled() {
            if (
                this.approvalStatus &&
                this.approvalStatus === TrainStationApprovalStatus.APPROVED &&
                this.command === TrainStationApprovalCommand.APPROVE
            ) {
                return true;
            }

            return this.approvalStatus &&
                this.approvalStatus === TrainStationApprovalStatus.REJECTED &&
                this.command === TrainStationApprovalCommand.REJECT;
        },
    },
    methods: {
        async do() {
            if (this.busy) return;

            this.busy = true;

            let status;

            switch (this.command) {
                case TrainStationApprovalCommand.APPROVE:
                    status = TrainStationApprovalStatus.APPROVED;
                    break;
                case TrainStationApprovalCommand.REJECT:
                    status = TrainStationApprovalStatus.REJECTED;
                    break;
                default:
                    status = null;
                    break;
            }

            try {
                const item = await this.$api.trainStation.update(this.entityId, {
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
