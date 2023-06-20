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
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { useAPI, useRuntimeConfig } from '#imports';
import { wrapFnWithBusyState } from '../../../../core/busy';
import { useAuthStore } from '../../../../store/auth';
import type { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../../core/render/action-command/utils';

export default defineNuxtComponent({
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
        command: {
            type: String as PropType<TrainAPICommand | 'resultDownload'>,
            default: TrainAPICommand.RESULT_START,
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

        const runtimeConfig = useRuntimeConfig();
        const toast = useToast();

        const store = useAuthStore();
        const isAllowed = computed(() => store.has(PermissionID.TRAIN_RESULT_READ));

        const isDisabled = computed(() => {
            if (refs.entity.value.run_status !== TrainRunStatus.FINISHED) {
                return true;
            }

            if (refs.command.value === 'resultDownload') {
                return !refs.entity.value.result_status ||
                    (
                        refs.entity.value.result_status !== TrainResultStatus.FINISHED &&
                        refs.entity.value.result_status !== TrainResultStatus.DOWNLOADED
                    );
            }

            if (refs.command.value === TrainAPICommand.RESULT_START) {
                return !!refs.entity.value.result_status &&
                    [
                        TrainResultStatus.FAILED,
                    ].indexOf(refs.entity.value.result_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (refs.command.value) {
                case 'resultDownload':
                    return 'download';
                case TrainAPICommand.RESULT_START:
                    return 'start';
                case TrainAPICommand.RESULT_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (refs.command.value) {
                case 'resultDownload':
                    return 'fa fa-download';
                case TrainAPICommand.RESULT_START:
                    return 'fa fa-wrench';
                case TrainAPICommand.RESULT_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.command.value) {
                case 'resultDownload':
                    return 'dark';
                case TrainAPICommand.RESULT_START:
                    return 'success';
                case TrainAPICommand.RESULT_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            if (refs.command.value === 'resultDownload') {
                window.open(
                    new URL(
                        useAPI().train.getResultDownloadPath(refs.entity.value.id),
                        runtimeConfig.public.apiUrl,
                    ).href,
                    '_blank',
                );
                return;
            }

            try {
                const train = await useAPI().train.runCommand(refs.entity.value.id, refs.command.value);
                emit('done', train);

                const message = `Successfully executed result command ${commandText.value}`;
                if (toast) {
                    toast.success({ body: message });
                }
            } catch (e) {
                if (e instanceof Error) {
                    if (toast) {
                        toast.success({ body: e.message });
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
