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
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { renderActionCommand } from '../../../core/render/action-command/utils';
import type { ActionCommandProperties } from '../../../core/render/action-command/type';
import { useAuthStore } from '../../../store/auth';

export default defineComponent({
    name: 'TrainStationCommand',
    props: {
        entityId: {
            type: String,
            required: true,
        },
        approvalStatus: String as PropType<TrainStationApprovalStatus>,

        command: {
            type: String as PropType<TrainStationApprovalCommand>,
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
                case TrainStationApprovalCommand.APPROVE:
                    return 'approve';
                case TrainStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (refs.command.value) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case TrainStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.command.value) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'success';
                case TrainStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const store = useAuthStore();

        const isDisabled = computed(() => {
            if (
                refs.approvalStatus.value &&
                refs.approvalStatus.value === TrainStationApprovalStatus.APPROVED &&
                refs.command.value === TrainStationApprovalCommand.APPROVE
            ) {
                return true;
            }

            return !!refs.approvalStatus.value &&
                refs.approvalStatus.value === TrainStationApprovalStatus.REJECTED &&
                refs.command.value === TrainStationApprovalCommand.REJECT;
        });

        const execute = async () => {
            if (busy.value) return;

            busy.value = true;

            let status;

            switch (refs.command.value) {
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
                const item = await useAPI().trainStation.update(refs.entityId.value, {
                    approval_status: status,
                });

                emit('updated', item);
            } catch (e) {
                emit('failed', e);
            }

            busy.value = false;
        };

        return () => renderActionCommand({
            execute,
            elementType: refs.elementType.value,
            withIcon: refs.withIcon.value,
            withText: refs.withText.value,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: store.has(PermissionID.TRAIN_APPROVE),
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
