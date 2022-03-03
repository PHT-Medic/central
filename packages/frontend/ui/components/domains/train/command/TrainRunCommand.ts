/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import Vue, { PropType, VNodeData } from 'vue';
import {
    PermissionID,
    TrainBuildStatus,
    TrainCommand,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { BDropdownItem } from 'bootstrap-vue';
import { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../render/utils';
import { ActionCommandMethods } from '../../../render/type';

export const TrainRunCommand = Vue.extend<any, ActionCommandMethods, any, TrainCommandProperties>({
    props: {
        entity: {
            type: Object,
            default: undefined,
        },
        command: {
            type: String as PropType<TrainCommand>,
            default: TrainCommand.RUN_START,
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
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        isAllowed() {
            return this.$auth.hasPermission(PermissionID.TRAIN_EXECUTION_START) ||
                this.$auth.hasPermission(PermissionID.TRAIN_EXECUTION_STOP);
        },
        isDisabled() {
            if (this.entity.build_status !== TrainBuildStatus.FINISHED) {
                return true;
            }

            if (
                this.command === TrainCommand.RUN_START &&
                [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.entity.run_status) === -1
            ) {
                return true;
            }

            return this.command === TrainCommand.RUN_RESET &&
                [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.entity.run_status) === -1;
        },
        commandText() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'start';
                case TrainCommand.RUN_RESET:
                    return 'reset';
                case TrainCommand.RUN_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'fa fa-play';
                case TrainCommand.RUN_RESET:
                    return 'fa-solid fa-retweet';
                case TrainCommand.RUN_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainCommand.RUN_START:
                    return 'success';
                case TrainCommand.RUN_RESET:
                    return 'danger';
                case TrainCommand.RUN_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        },
    },
    methods: {
        async do() {
            if (this.busy || this.isDisabled || !this.isAllowed) return;

            this.busy = true;

            try {
                const train = await this.$api.train.runCommand(this.entity.id, this.command);

                const message = `Successfully executed run command ${this.commandText}.`;
                this.$bvToast.toast(message, { toaster: 'b-toaster-top-center', variant: 'success' });

                this.$emit('done', train);
            } catch (e) {
                this.$bvToast.toast(e.message, { toaster: 'b-toaster-top-center', variant: 'danger' });

                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
    render(createElement) {
        return renderActionCommand(this, createElement);
    },
});
