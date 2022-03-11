<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
    TrainBuildStatus, TrainCommand,
    TrainConfigurationStatus, TrainResultStatus,
    TrainRunStatus,
} from '@personalhealthtrain/central-common';
import { TrainResultCommand } from './command/TrainResultCommand';
import TrainBuildStatusText from './status/TrainBuildStatusText';
import { TrainBuildCommand } from './command/TrainBuildCommand';
import TrainRunStatusText from './status/TrainRunStatusText';
import { TrainRunCommand } from './command/TrainRunCommand';
import TrainResultStatusText from '../train-result/status/TrainResultStatusText';

import TrainConfigurationStatusText from './status/TrainConfigurationStatusText';

export default {
    components: {
        TrainResultCommand,
        TrainConfigurationStatusText,
        TrainResultStatusText,
        TrainRunCommand,
        TrainRunStatusText,
        TrainBuildCommand,
        TrainBuildStatusText,
    },
    props: {
        listDirection: {
            type: String,
            default: 'row',
        },
        withCommand: {
            type: Boolean,
            default: true,
        },
        entity: Object,
    },
    data() {
        return {
            trainBuildStatus: TrainBuildStatus,
            trainConfigurationStatus: TrainConfigurationStatus,
            trainRunStatus: TrainRunStatus,
            trainResultStatus: TrainResultStatus,
            trainCommand: TrainCommand,

            busy: false,
        };
    },
    computed: {
        canEdit() {
            return this.$auth.hasPermission(PermissionID.TRAIN_EDIT);
        },

        // ---------------------------------------------------------

        canConfigure() {
            return this.canEdit &&
                this.entity.configuration_status !== TrainConfigurationStatus.FINISHED;
        },
    },
    methods: {
        handleUpdated(item) {
            this.$emit('updated', item);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>
<template>
    <div
        class="d-flex justify-content-between mb-2 mt-2"
        :class="{
            'flex-column': listDirection === 'column',
            'flex-row': listDirection === 'row'
        }"
    >
        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'mb-2 flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="mr-1">
                <strong>1. Config</strong>
            </div>
            <div>
                Status: <train-configuration-status-text :status="entity.configuration_status" />
            </div>
            <div
                v-if="withCommand"
                class="ml-auto"
            >
                <nuxt-link
                    v-if="canConfigure"
                    class="btn btn-xs btn-primary"
                    type="button"
                    :to="'/trains/'+entity.id+'/setup'"
                >
                    <i class="fas fa-wrench pr-1" /> setup
                </nuxt-link>
            </div>
        </div>

        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'mb-2 flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="mr-1">
                <strong>2. Build</strong>
            </div>
            <div>
                Status: <train-build-status-text :status="entity.build_status" />
            </div>
            <div
                v-if="withCommand"
                class="ml-auto flex-row d-flex"
            >
                <train-build-command
                    class="mr-1"
                    :command="trainCommand.BUILD_START"
                    :with-icon="true"
                    :entity="entity"
                    @done="handleUpdated"
                    @failed="handleFailed"
                />
                <b-dropdown
                    variant="dark"
                    size="xs"
                    html="<i class='fa fa-bars' />"
                >
                    <train-build-command
                        :command="trainCommand.BUILD_STATUS"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                    <train-build-command
                        :command="trainCommand.BUILD_STOP"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                </b-dropdown>
            </div>
        </div>

        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'mb-2 flex-row justify-content-between': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="mr-1">
                <strong>3. Run</strong>
            </div>
            <div>
                Status: <train-run-status-text :status="entity.run_status" />
            </div>
            <div
                v-if="withCommand"
                class="ml-auto flex-row d-flex"
            >
                <train-run-command
                    class="mr-1"
                    :command="trainCommand.RUN_START"
                    :with-icon="true"
                    :entity="entity"
                    @done="handleUpdated"
                    @failed="handleFailed"
                />
                <b-dropdown
                    id="dropdown-1"
                    text="Dropdown Button"
                    variant="dark"
                    size="xs"
                    html="<i class='fa fa-bars' />"
                >
                    <train-run-command
                        :command="trainCommand.RUN_STATUS"
                        :with-icon="true"
                        :element-type="'dropDownItem'"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                    <train-run-command
                        :command="trainCommand.RUN_RESET"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                </b-dropdown>
            </div>
        </div>
        <div
            class="d-flex flex-grow-1 align-items-center"
            style="flex-basis: 0"
            :class="{
                'flex-row': listDirection === 'column',
                'flex-column': listDirection === 'row'
            }"
        >
            <div class="mr-1">
                <strong>4. Result</strong>
            </div>
            <div>
                Status: <train-result-status-text :status="entity.result_status" />
            </div>
            <div
                v-if="withCommand"
                class="ml-auto flex-row d-flex"
            >
                <train-result-command
                    class="mr-1"
                    :command="'resultDownload'"
                    :with-icon="true"
                    :entity="entity"
                    @done="handleUpdated"
                    @failed="handleFailed"
                />
                <train-result-command
                    class="mr-1"
                    :command="trainCommand.RESULT_START"
                    :with-icon="true"
                    :entity="entity"
                    @done="handleUpdated"
                    @failed="handleFailed"
                />
                <b-dropdown
                    variant="dark"
                    size="xs"
                    html="<i class='fa fa-bars' />"
                >
                    <train-result-command
                        :command="trainCommand.RESULT_STATUS"
                        :with-icon="true"
                        :element-type="'dropDownItem'"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                    <train-result-command
                        :command="trainCommand.RESULT_STOP"
                        :element-type="'dropDownItem'"
                        :with-icon="true"
                        :entity="entity"
                        @done="handleUpdated"
                        @failed="handleFailed"
                    />
                </b-dropdown>
            </div>
        </div>
    </div>
</template>
