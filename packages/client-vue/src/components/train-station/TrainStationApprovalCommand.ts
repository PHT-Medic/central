/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    PermissionID, TrainStationApprovalCommand,
    TrainStationApprovalStatus,
} from '@personalhealthtrain/core';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { ActionCommandProperties } from '../../core';
import { createActionRenderFn, injectAPIClient, injectAuthupStore } from '../../core';

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
    setup(props, setup) {
        const apiClient = injectAPIClient();
        const busy = ref(false);

        const commandText = computed(() => {
            switch (props.command) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'approve';
                case TrainStationApprovalCommand.REJECT:
                    return 'reject';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'fa fa-check';
                case TrainStationApprovalCommand.REJECT:
                    return 'fa fa-ban';
                default:
                    return 'fa fa-sync-alt';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case TrainStationApprovalCommand.APPROVE:
                    return 'success';
                case TrainStationApprovalCommand.REJECT:
                    return 'danger';
                default:
                    return 'info';
            }
        });

        const store = injectAuthupStore();

        const isDisabled = computed(() => {
            if (
                props.approvalStatus &&
                props.approvalStatus === TrainStationApprovalStatus.APPROVED &&
                props.command === TrainStationApprovalCommand.APPROVE
            ) {
                return true;
            }

            return !!props.approvalStatus &&
                props.approvalStatus === TrainStationApprovalStatus.REJECTED &&
                props.command === TrainStationApprovalCommand.REJECT;
        });

        const execute = async () => {
            if (busy.value) return;

            busy.value = true;

            let status;

            switch (props.command) {
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
                const item = await apiClient.trainStation.update(props.entityId, {
                    approval_status: status,
                });

                setup.emit('updated', item);
            } catch (e) {
                setup.emit('failed', e);
            }

            busy.value = false;
        };

        const renderFn = createActionRenderFn({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: store.has(PermissionID.TRAIN_APPROVE),
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots: setup.slots,
        });

        return () => renderFn();
    },
});
