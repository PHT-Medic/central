/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    PermissionID,
    ProposalStationApprovalCommand,
    ProposalStationApprovalStatus,
} from '@personalhealthtrain/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, ref,
} from 'vue';
import {
    injectAPIClient,
    injectAuthupStore,
    renderActionCommand,
    wrapFnWithBusyState,
} from '../../core';
import type { ActionCommandProperties } from '../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        approvalStatus: String as PropType<ProposalStationApprovalStatus>,
        command: {
            type: String as PropType<ProposalStationApprovalCommand>,
            required: true,
        },
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
    emits: ['failed', 'updated'],
    setup(props, { emit, slots }) {
        const busy = ref(false);
        const apiClient = injectAPIClient();

        const commandText = computed(() => {
            switch (props.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'approve';
                case ProposalStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case ProposalStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'success';
                case ProposalStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const store = injectAuthupStore();

        const isDisabled = computed(() => {
            if (props.approvalStatus) {
                if (
                    props.approvalStatus === ProposalStationApprovalStatus.APPROVED &&
                    props.command === ProposalStationApprovalCommand.APPROVE
                ) {
                    return true;
                }

                return props.approvalStatus === ProposalStationApprovalStatus.REJECTED &&
                    props.command === ProposalStationApprovalCommand.REJECT;
            }

            return props.command === ProposalStationApprovalCommand.REJECT;
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            let status;

            switch (props.command) {
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
                const item = await apiClient.proposalStation.update(props.entityId, {
                    approval_status: status,
                });

                emit('updated', item);
            } catch (e) {
                emit('failed', e);
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: store.has(PermissionID.PROPOSAL_APPROVE),
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
