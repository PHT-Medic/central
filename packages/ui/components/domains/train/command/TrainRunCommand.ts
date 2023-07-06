/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useToast } from 'bootstrap-vue-next';
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import {
    PermissionID,
    TrainAPICommand,
    TrainBuildStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { useAPI } from '#imports';
import { wrapFnWithBusyState } from '../../../../core/busy';
import { useAuthStore } from '../../../../store/auth';
import type { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../../core/action-command/utils';

export default defineNuxtComponent({
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
        command: {
            type: String as PropType<TrainAPICommand>,
            default: TrainAPICommand.RUN_START,
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
    emits: ['failed', 'done'],
    setup(props, { emit, slots }) {
        const refs = toRefs(props);
        const busy = ref(false);

        const toast = useToast();

        const store = useAuthStore();
        const isAllowed = computed(() => store.has(PermissionID.TRAIN_EXECUTION_START) ||
                store.has(PermissionID.TRAIN_EXECUTION_STOP));

        const isDisabled = computed(() => {
            if (refs.entity.value.build_status !== TrainBuildStatus.FINISHED) {
                return true;
            }

            if (refs.command.value === TrainAPICommand.RUN_START) {
                return !!refs.entity.value.run_status &&
                    [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(refs.entity.value.run_status) === -1;
            }

            if (refs.command.value === TrainAPICommand.RUN_RESET) {
                return !!refs.entity.value.run_status &&
                    [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(refs.entity.value.run_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (refs.command.value) {
                case TrainAPICommand.RUN_START:
                    return 'start';
                case TrainAPICommand.RUN_RESET:
                    return 'reset';
                case TrainAPICommand.RUN_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (refs.command.value) {
                case TrainAPICommand.RUN_START:
                    return 'fa fa-play';
                case TrainAPICommand.RUN_RESET:
                    return 'fa-solid fa-retweet';
                case TrainAPICommand.RUN_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.command.value) {
                case TrainAPICommand.RUN_START:
                    return 'success';
                case TrainAPICommand.RUN_RESET:
                    return 'danger';
                case TrainAPICommand.RUN_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await useAPI().train.runCommand(refs.entity.value.id, refs.command.value);

                if (toast) {
                    toast.success({ body: `Successfully executed run command ${commandText.value}.` });
                }

                emit('done', train);
            } catch (e) {
                if (e instanceof Error) {
                    if (toast) {
                        toast.warning({ body: e.message });
                    }

                    emit('failed', e);
                }
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: refs.elementType.value,
            withIcon: refs.withIcon.value,
            withText: refs.withText.value,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: isAllowed.value,
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
