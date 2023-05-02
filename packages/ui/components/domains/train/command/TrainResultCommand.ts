/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { PropType } from 'vue';
import Vue from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import {
    PermissionID,
    TrainAPICommand,
    TrainBuildStatus,
    TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import type { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../../core/render/action-command/utils';
import type { ActionCommandMethods } from '../../../../core/render/action-command/type';

export const TrainResultCommand = Vue.extend<any, ActionCommandMethods, any, TrainCommandProperties>({
    props: {
        entity: {
            type: Object as PropType<Train>,
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
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        isAllowed() {
            return this.$auth.has(PermissionID.TRAIN_RESULT_READ);
        },
        isDisabled() {
            if (this.entity.run_status !== TrainRunStatus.FINISHED) {
                return true;
            }

            if (
                this.command === 'resultDownload'
            ) {
                return !this.entity.result_status ||
                    (
                        this.entity.result_status !== TrainResultStatus.FINISHED &&
                        this.entity.result_status !== TrainResultStatus.DOWNLOADED
                    );
            }

            if (
                this.command === TrainAPICommand.RESULT_START
            ) {
                return this.entity.result_status &&
                    [
                        TrainBuildStatus.STOPPED,
                        TrainBuildStatus.FAILED,
                    ].indexOf(this.entity.result_status) === -1;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case 'resultDownload':
                    return 'download';
                case TrainAPICommand.RESULT_START:
                    return 'start';
                case TrainAPICommand.RESULT_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case 'resultDownload':
                    return 'fa fa-download';
                case TrainAPICommand.RESULT_START:
                    return 'fa fa-wrench';
                case TrainAPICommand.RESULT_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case 'resultDownload':
                    return 'dark';
                case TrainAPICommand.RESULT_START:
                    return 'success';
                case TrainAPICommand.RESULT_STATUS:
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
                        window.open(new URL(this.$api.train.getResultDownloadPath(this.entity.id), this.$config.apiUrl).href, '_blank');
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
