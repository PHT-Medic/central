<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import TrainResultCommand from "@/components/train/command/TrainResultCommand";
import {TrainResultStatus} from "@/domains/train-result/type";
import TrainBuildStatusText from "@/components/train/status/TrainBuildStatusText";
import TrainBuildCommand from "@/components/train/command/TrainBuildCommand";
import TrainRunStatusText from "@/components/train/status/TrainRunStatusText";
import TrainRunCommand from "@/components/train/command/TrainRunCommand";
import TrainResultStatusIcon from "@/components/train-result/status/TrainResultStatusIcon";
import TrainResultStatusText from "@/components/train-result/status/TrainResultStatusText";

import {TrainBuildStatus, TrainConfigurationStatus, TrainRunStatus} from "@/domains/train";
import {TrainCommand} from "@/domains/train/type";
import TrainConfigurationStatusText from "@/components/train/status/TrainConfigurationStatusText";

export default {
    components: {
        TrainResultCommand,
        TrainConfigurationStatusText,
        TrainResultStatusText,
        TrainResultStatusIcon,
        TrainRunCommand,
        TrainRunStatusText,
        TrainBuildCommand,
        TrainBuildStatusText
    },
    props: {
        listDirection: {
            type: String,
            default: 'row'
        },
        withCommand: {
            type: Boolean,
            default: true
        },
        trainProperty: Object
    },
    created() {
        this.train = this.trainProperty;
    },
    data() {
        return {
            train: null,

            trainBuildStatus: TrainBuildStatus,
            trainConfigurationStatus: TrainConfigurationStatus,
            trainRunStatus: TrainRunStatus,
            trainResultStatus: TrainResultStatus,
            trainCommand: TrainCommand,

            busy: false
        }
    },
    computed: {
        canEdit() {
            return this.$auth.can('edit','train');
        },

        // ---------------------------------------------------------

        canConfigure() {
            return this.canEdit && this.train.configurationStatus !== TrainConfigurationStatus.FINISHED;
        },
    },
    methods: {
        handleDone(train) {
            for(let key in train) {
                Vue.set(this.train, key, train[key]);
            }

            this.$emit('done', train);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        }
    }
}
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
            class="d-flex flex-column flex-grow-1" style="flex-basis: 0"
            :class="{
                'mb-2': listDirection === 'column'
            }"
        >
            <div>
                <strong>1. Config</strong>
            </div>
            <div>
                Status: <train-configuration-status-text :status="train.configurationStatus" />
            </div>
            <div v-if="withCommand" class="mt-1">
                <nuxt-link v-if="canConfigure" class="btn btn-xs btn-primary" type="button" :to="'/trains/'+train.id+'/wizard'">
                    <i class="fas fa-cog pr-1" /> setup
                </nuxt-link>
            </div>
        </div>

        <div
            class="d-flex flex-column flex-grow-1" style="flex-basis: 0"
            :class="{
                'mb-2': listDirection === 'column'
            }"
        >
            <div>
                <strong>2. Build</strong>
            </div>
            <div>
                Status: <train-build-status-text :status="train.buildStatus" />
                <train-build-command
                    class="ml-1"
                    :command="trainCommand.BUILD_STATUS"
                    :element-type="'link'"
                    :with-text="false"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
            <div v-if="withCommand" class="mt-1 flex-row d-flex">
                <train-build-command
                    class="mr-1"
                    :command="trainCommand.BUILD_START"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
                <train-build-command
                    :command="trainCommand.BUILD_STOP"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
        </div>

        <div
            class="d-flex flex-column flex-grow-1" style="flex-basis: 0"
            :class="{
                'mb-2': listDirection === 'column'
            }"
        >
            <div>
                <strong>3. Run</strong>
            </div>
            <div>
                Status: <train-run-status-text :status="train.runStatus" />
                <train-run-command
                    class="ml-1"
                    :command="trainCommand.RUN_STATUS"
                    :with-text="false"
                    :with-icon="true"
                    :element-type="'link'"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
            <div v-if="withCommand" class="mt-1 flex-row d-flex">
                <train-run-command
                    class="mr-1"
                    :command="trainCommand.RUN_START"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
                <train-run-command
                    :command="trainCommand.RUN_STOP"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
        </div>
        <div
            class="d-flex flex-column flex-grow-1" style="flex-basis: 0"
        >
            <div>
                <strong>4. Result</strong>
            </div>
            <div >
                Status: <train-result-status-text :status="train.resultStatus" />
                <train-result-command
                    class="ml-1"
                    :command="trainCommand.RESULT_STATUS"
                    :with-text="false"
                    :with-icon="true"
                    :element-type="'link'"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
            <div v-if="withCommand" class="mt-1 flex-row d-flex">
                <train-result-command
                    class="mr-1"
                    :command="trainCommand.RESULT_DOWNLOAD"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
                <train-result-command
                    class="mr-1"
                    :command="trainCommand.RESULT_START"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
                <train-result-command
                    :command="trainCommand.RESULT_STOP"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
        </div>
    </div>
</template>
