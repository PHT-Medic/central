/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { PropType } from 'vue';
import Vue from 'vue';
import {
    PermissionID,
    TrainAPICommand,
    TrainBuildStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import type { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../../core/render/action-command/utils';
import type { ActionCommandMethods } from '../../../../core/render/action-command/type';

export const TrainRunCommand = Vue.extend<any, ActionCommandMethods, any, TrainCommandProperties>({
    props: {
        entity: {
            type: Object,
            default: undefined,
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
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        isAllowed() {
            return this.$auth.has(PermissionID.TRAIN_EXECUTION_START) ||
                this.$auth.has(PermissionID.TRAIN_EXECUTION_STOP);
        },
        isDisabled() {
            if (this.entity.build_status !== TrainBuildStatus.FINISHED) {
                return true;
            }

            if (
                this.command === TrainAPICommand.RUN_START
            ) {
                return this.entity.run_status &&
                    [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.entity.run_status) === -1;
            }

            if (
                this.command === TrainAPICommand.RUN_RESET
            ) {
                return this.entity.run_status &&
                    [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.entity.run_status) === -1;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case TrainAPICommand.RUN_START:
                    return 'start';
                case TrainAPICommand.RUN_RESET:
                    return 'reset';
                case TrainAPICommand.RUN_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainAPICommand.RUN_START:
                    return 'fa fa-play';
                case TrainAPICommand.RUN_RESET:
                    return 'fa-solid fa-retweet';
                case TrainAPICommand.RUN_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainAPICommand.RUN_START:
                    return 'success';
                case TrainAPICommand.RUN_RESET:
                    return 'danger';
                case TrainAPICommand.RUN_STATUS:
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
