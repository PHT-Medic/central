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
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { wrapFnWithBusyState } from '../../../core/busy';
import { renderActionCommand } from '../../../core/render/action-command/utils';
import type { ActionCommandProperties } from '../../../core/render/action-command/type';
import { useAuthStore } from '../../../store/auth';

export default defineComponent({
    name: 'ProposalStationCommand',
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
        const refs = toRefs(props);
        const busy = ref(false);

        const commandText = computed(() => {
            switch (refs.command.value) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'approve';
                case ProposalStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (refs.command.value) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case ProposalStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.command.value) {
                case ProposalStationApprovalCommand.APPROVE:
                    return 'success';
                case ProposalStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const store = useAuthStore();

        const isDisabled = computed(() => {
            if (
                refs.approvalStatus.value &&
                refs.approvalStatus.value === ProposalStationApprovalStatus.APPROVED &&
                refs.command.value === ProposalStationApprovalCommand.APPROVE
            ) {
                return true;
            }

            return !!refs.approvalStatus.value &&
                refs.approvalStatus.value === ProposalStationApprovalStatus.REJECTED &&
                refs.command.value === ProposalStationApprovalCommand.REJECT;
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            let status;

            switch (refs.command.value) {
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
                const item = await useAPI().proposalStation.update(refs.entityId.value, {
                    approval_status: status,
                });

                emit('updated', item);
            } catch (e) {
                emit('failed', e);
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: refs.elementType.value,
            withIcon: refs.withIcon.value,
            withText: refs.withText.value,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: store.has(PermissionID.PROPOSAL_APPROVE),
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
