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
    TrainConfigurationStatus,
} from '@personalhealthtrain/central-common';
import type { TrainCommandProperties } from './type';
import { renderActionCommand } from '../../../../core/render/action-command/utils';
import type { ActionCommandMethods } from '../../../../core/render/action-command/type';

export const TrainBuildCommand = Vue.extend<any, ActionCommandMethods, any, TrainCommandProperties>({
    props: {
        entity: {
            type: Object as PropType<Train>,
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
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        isAllowed() {
            return this.$auth.has(PermissionID.TRAIN_EDIT);
        },
        isDisabled() {
            if (this.entity.configuration_status !== TrainConfigurationStatus.FINISHED) {
                return true;
            }

            if (
                this.command === TrainAPICommand.BUILD_START
            ) {
                return this.entity.build_status &&
                    [
                        TrainBuildStatus.STOPPED,
                        TrainBuildStatus.STOPPING,
                        TrainBuildStatus.FAILED,
                    ].indexOf(this.entity.build_status) === -1;
            }

            if (this.command === TrainAPICommand.BUILD_STOP) {
                return this.entity.build_status && [
                    TrainBuildStatus.STARTING,
                    TrainBuildStatus.STARTED,
                    TrainBuildStatus.STOPPING,
                ].indexOf(this.entity.build_status) === -1;
            }

            return false;
        },
        commandText() {
            switch (this.command) {
                case TrainAPICommand.BUILD_START:
                    return 'start';
                case TrainAPICommand.BUILD_STOP:
                    return 'stop';
                case TrainAPICommand.BUILD_STATUS:
                    return 'check';
                default:
                    return '';
            }
        },
        iconClass() {
            switch (this.command) {
                case TrainAPICommand.BUILD_START:
                    return 'fa fa-play';
                case TrainAPICommand.BUILD_STOP:
                    return 'fa fa-stop';
                case TrainAPICommand.BUILD_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        },
        classSuffix() {
            switch (this.command) {
                case TrainAPICommand.BUILD_START:
                    return 'success';
                case TrainAPICommand.BUILD_STOP:
                    return 'danger';
                case TrainAPICommand.BUILD_STATUS:
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

                const message = `Successfully executed build command ${this.commandText}`;
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
