<script>
import Vue from 'vue';
import TrainBuildStatusText from "@/components/train/status/TrainBuildStatusText";
import TrainBuildCommand from "@/components/train/command/TrainBuildCommand";
import TrainRunStatusText from "@/components/train/status/TrainRunStatusText";
import TrainRunCommand from "@/components/train/command/TrainRunCommand";
import TrainResultStatusIcon from "@/components/train-result/status/TrainResultStatusIcon";
import TrainResultStatusText from "@/components/train-result/status/TrainResultStatusText";
import TrainResultDownload from "@/components/train-result/TrainResultDownload";

import {TrainBuildStatus, TrainConfigurationStatus, TrainResultStatus, TrainRunStatus} from "@/domains/train";
import {TrainCommand} from "@/domains/train/type";
import TrainConfigurationStatusText from "@/components/train/status/TrainConfigurationStatusText";

export default {
    components: {
        TrainConfigurationStatusText,
        TrainResultDownload,
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
        isPermittedToEdit() {
            return this.$auth.can('edit','train');
        },

        // ---------------------------------------------------------

        resultStatus() {
            return this.train.result ? this.train.result.status : null;
        },


        // ---------------------------------------------------------

        canConfigure() {
            return this.isPermittedToEdit && this.train.configurationStatus !== TrainConfigurationStatus.FINISHED;
        },

        canBuildStart() {
            return this.canBuildCommand(TrainCommand.BUILD_START);
        },
        canBuildStop() {
            return this.canBuildCommand(TrainCommand.BUILD_STOP);
        },

        canRunStart() {
            return this.canRunCommand(TrainCommand.START);
        },
        canRunStop() {
            return this.canRunCommand(TrainCommand.STOP);
        },

        canInspectResult() {
            return this.train.runStatus === TrainRunStatus.FINISHED;
        }
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
        },

        // ---------------------------------------------------------

        canBuildCommand(command) {
            if(
                this.train.configurationStatus !== TrainConfigurationStatus.FINISHED ||
                !this.$auth.can('edit','train')
            ) {
                return false;
            }

            switch (command) {
                case TrainCommand.BUILD_START:
                    return [
                        TrainBuildStatus.STARTED,
                        TrainBuildStatus.FINISHED
                    ].indexOf(this.train.buildStatus) === -1
                case TrainCommand.BUILD_STOP:
                    return this.train.buildStatus && [
                        TrainBuildStatus.STOPPED,
                        TrainBuildStatus.FINISHED,
                        TrainBuildStatus.FAILED
                    ].indexOf(this.train.buildStatus) === -1
            }

            return false;
        },
        canRunCommand(command) {
            if(this.train.configurationStatus !== TrainConfigurationStatus.FINISHED ||
                this.train.buildStatus !== TrainBuildStatus.FINISHED
                // startExecution /stopExecution
            ) {
                return false;
            }

            switch (command) {
                case TrainCommand.START:
                    return !this.train.runStatus || [TrainRunStatus.STOPPED, TrainRunStatus.STOPPING, TrainRunStatus.FAILED].indexOf(this.train.runStatus) !== -1
                case TrainCommand.STOP:
                    return this.train.runStatus && [TrainRunStatus.STOPPED, TrainRunStatus.FINISHED].indexOf(this.train.runStatus) === -1
            }

            return false;
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
            class="d-flex flex-column"
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
            class="d-flex flex-column"
            :class="{
                'mb-2': listDirection === 'column'
            }"
        >
            <div>
                <strong>2. Build</strong>
            </div>
            <div>
                Status: <train-build-status-text :status="train.buildStatus" />
            </div>
            <div v-if="withCommand" class="mt-1 flex-row d-flex justify-content-between">
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
            class="d-flex flex-column"
            :class="{
                'mb-2': listDirection === 'column'
            }"
        >
            <div>
                <strong>3. Run</strong>
            </div>
            <div>
                Status: <train-run-status-text :status="train.runStatus" />
            </div>
            <div v-if="withCommand" class="mt-1 flex-row d-flex justify-content-between">
                <train-run-command
                    v-if="canRunStart"
                    class="mr-1"
                    :command="trainCommand.START"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
                <train-run-command
                    v-if="canRunStop"
                    :command="trainCommand.STOP"
                    :with-icon="true"
                    :train="train"
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
        </div>
        <div
            class="d-flex flex-column"
        >
            <div>
                <strong>4. Result</strong>
            </div>
            <div >
                Status: <train-result-status-icon :status="resultStatus" /> <train-result-status-text :status="resultStatus" />
            </div>
            <div v-if="withCommand" class="mt-1">
                <train-result-download v-if="canInspectResult" :train="train" />
            </div>
        </div>
    </div>
</template>
