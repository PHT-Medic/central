/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import Vue, { PropType } from 'vue';
import {
    PermissionID,
    Train,
    TrainBuildStatus,
    TrainCommand,
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../render/utils';
import { ActionCommandMethods } from '../../../render/type';

export const TrainResultCommand = Vue.extend<any, ActionCommandMethods, any, TrainCommandProperties>({
    props: {
        entity: {
            type: Object as PropType<Train>,
        },
        command: {
            type: String as PropType<TrainCommand | 'resultDownload'>,
            default: TrainCommand.RESULT_START,
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
            return this.$auth.hasPermission(PermissionID.TRAIN_RESULT_READ);
        },
        isDisabled() {
            if (this.entity.run_status !== TrainRunStatus.FINISHED) {
                return true;
            }

            if (
                this.command === 'resultDownload' &&
                !this.entity.result_status
            ) {
                return true;
            }

            if (
                this.command === TrainCommand.RESULT_START &&
                this.entity.result_status &&
                [
                    TrainBuildStatus.STOPPED,
                    TrainBuildStatus.FAILED,
                ].indexOf(this.command) === -1
            ) {
                return true;
            }

            return this.command === TrainCommand.RESULT_STOP &&
                this.entity.result_status &&
                [
                    TrainResultStatus.STARTING,
                    TrainResultStatus.STARTED,
                    TrainResultStatus.FINISHED,
                    TrainResultStatus.STOPPING,
                ].indexOf(this.command) === -1;
        },
        commandText() {
            switch (this.command) {
                case 'resultDownload':
                    return 'download';
                case TrainCommand.RESULT_START:
                    return 'start';
                case TrainCommand.RESULT_STOP:
                    return 'stop';
                case TrainCommand.RESULT_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case 'resultDownload':
                    return 'fa fa-download';
                case TrainCommand.RESULT_START:
                    return 'fa fa-wrench';
                case TrainCommand.RESULT_STOP:
                    return 'fa fa-stop';
                case TrainCommand.RESULT_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case 'resultDownload':
                    return 'dark';
                case TrainCommand.RESULT_START:
                    return 'success';
                case TrainCommand.RESULT_STOP:
                    return 'danger';
                case TrainCommand.RESULT_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        },
    },
    methods: {
        async do() {
            if (this.busy || !this.isAllowed || !this.isAllowed) return;

            this.busy = true;

            try {
                switch (this.command) {
                    case 'resultDownload':
                        window.open(`${this.$config.resultServiceApiUrl}train-results/${this.entity.id}/download`);
                        break;
                    default: {
                        const train = await this.$api.train.runCommand(this.entity.id, this.command);
                        this.$emit('done', train);
                        break;
                    }
                }

                const message = `Successfully executed result command ${this.commandText}`;
                this.$bvToast.toast(message, { toaster: 'b-toaster-top-center', variant: 'success' });
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
