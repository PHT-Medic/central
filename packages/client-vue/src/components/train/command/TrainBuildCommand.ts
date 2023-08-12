/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { computed, defineComponent, ref } from 'vue';
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import {
    PermissionID,
    TrainAPICommand,
    TrainBuildStatus,
    TrainConfigurationStatus,
} from '@personalhealthtrain/central-common';
import {
    injectAPIClient, injectAuthupStore, renderActionCommand, wrapFnWithBusyState,
} from '../../../core';
import type { TrainCommandProperties } from './type';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
        command: {
            type: String as PropType<TrainAPICommand>,
            default: TrainAPICommand.BUILD_START,
        },

        elementType: {
            type: String as PropType<TrainCommandProperties['elementType']>,
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
    emits: ['failed', 'updated', 'executed'],
    setup(props, { emit, slots }) {
        const busy = ref(false);

        const store = injectAuthupStore();
        const isAllowed = computed(() => store.has(PermissionID.TRAIN_EDIT));

        const isDisabled = computed<boolean>(() => {
            if (props.entity.configuration_status !== TrainConfigurationStatus.FINISHED) {
                return true;
            }

            if (props.command === TrainAPICommand.BUILD_START) {
                return !!props.entity.build_status &&
                    [
                        TrainBuildStatus.STOPPED,
                        TrainBuildStatus.STOPPING,
                        TrainBuildStatus.FAILED,
                    ].indexOf(props.entity.build_status) === -1;
            }

            if (props.command === TrainAPICommand.BUILD_STOP) {
                return !!props.entity.build_status && [
                    TrainBuildStatus.STARTING,
                    TrainBuildStatus.STARTED,
                    TrainBuildStatus.STOPPING,
                ].indexOf(props.entity.build_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (props.command) {
                case TrainAPICommand.BUILD_START:
                    return 'start';
                case TrainAPICommand.BUILD_STOP:
                    return 'stop';
                case TrainAPICommand.BUILD_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (props.command) {
                case TrainAPICommand.BUILD_START:
                    return 'fa fa-play';
                case TrainAPICommand.BUILD_STOP:
                    return 'fa fa-stop';
                case TrainAPICommand.BUILD_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (props.command) {
                case TrainAPICommand.BUILD_START:
                    return 'success';
                case TrainAPICommand.BUILD_STOP:
                    return 'danger';
                case TrainAPICommand.BUILD_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await injectAPIClient()
                    .train.runCommand(props.entity.id, props.command);

                emit('executed', props.command);
                emit('updated', train);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: props.elementType,
            withIcon: props.withIcon,
            withText: props.withText,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: isAllowed.value,
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
