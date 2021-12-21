<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import {
    TrainConfigurationStatus,
    editAPITrain,
    getAPITrainStations,
} from '@personalhealthtrain/ui-common';
import TrainWizardConfiguratorStep from './wizard/TrainWizardConfiguratorStep';
import TrainFileManager from './file/TrainFileManager';
import TrainWizardHashStep from './wizard/TrainWizardHashStep';
import TrainWizardFinalStep from './wizard/TrainWizardFinalStep';
import TrainWizardExtraStep from './wizard/TrainWizardExtraStep';
import TrainImageCommand from './TrainImageCommand';

export default {
    components: {
        TrainImageCommand,
        TrainWizardExtraStep,
        TrainWizardFinalStep,
        TrainWizardHashStep,
        TrainFileManager,
        TrainWizardConfiguratorStep,
    },
    props: {
        trainProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            wizard: {
                initialized: false,
                valid: undefined,
                message: undefined,

                startIndex: 0,
                index: 0,
                steps: [
                    'configuration',
                    'files',
                    'extra',
                    'hash',
                    'finish',
                ],
            },
            train: {
                // required attributes for child components (id, proposal_id)
                id: null,
                proposal_id: null,

                query: null,
                master_image_id: null,
                station_ids: [],

                entrypoint_file_id: null,
                files: [],

                hash_signed: '',
                hash: null,
            },
            trainStation: {
                busy: false,
                items: [],
            },
            busy: false,
        };
    },
    computed: {
        canPassDefined() {
            return typeof this.wizard.valid !== 'undefined';
        },
        wizardMessage() {
            if (typeof this.wizard.message !== 'undefined') {
                return this.wizard.message;
            }

            return '';
        },
        isConfigured() {
            return this.trainProperty.configuration_status === TrainConfigurationStatus.FINISHED;
        },
        trainId() {
            return this.train ? this.train.id : undefined;
        },
    },
    created() {
        if (this.isConfigured) return;

        this.initTrainFromProperty();

        Promise.resolve()
            .then(this.loadTrainStations)
            .then(this.initWizard);
    },
    methods: {
        //----------------------------------
        // Train
        //----------------------------------
        initTrainFromProperty() {
            if (typeof this.trainProperty === 'undefined') return;

            for (const key in this.train) {
                if (!this.trainProperty.hasOwnProperty(key)) continue;

                this.train[key] = this.trainProperty[key];
            }

            if (
                this.trainProperty.proposal.master_image_id &&
                !this.trainProperty.master_image_id
            ) {
                this.train.master_image_id = this.trainProperty.proposal.master_image_id;
            }
        },
        async updateTrain(data) {
            if (!this.wizard.initialized) return;

            const keys = Object.keys(data);

            if (keys.length === 0) return;

            try {
                const train = await editAPITrain(this.trainProperty.id, data);

                const updateData = {
                    configuration_status: train.configuration_status,
                    ...data,
                };

                this.$emit('updated', updateData);
            } catch (e) {
                throw e;
            }
        },
        async loadTrainStations() {
            if (this.trainStation.busy || !this.trainId) return;

            this.trainStation.busy = true;

            try {
                const { data } = await getAPITrainStations({
                    filters: {
                        train_id: this.trainId,
                    },
                });

                this.trainStation.items = data;
            } catch (e) {
                console.log(e);
            }

            this.trainStation.busy = false;
        },

        //----------------------------------
        // wizard
        //----------------------------------
        async initWizard() {
            let canPass = true;
            let index = 0;

            while (canPass) {
                try {
                    await this.passWizardStep();

                    index++;
                    this.wizard.index = index;
                } catch (e) {
                    canPass = false;
                }

                if (index >= this.wizard.steps.length) {
                    canPass = false;
                }
            }

            if (process.server) {
                this.startIndex = index;
            } else {
                this.$refs.wizard.changeTab(0, index);
            }

            this.wizard.initialized = true;
        },

        passWizardStep() {
            return new Promise((resolve, reject) => {
                const step = this.wizard.steps[this.wizard.index];
                let promise;

                switch (step) {
                    case 'configuration':
                        promise = this.canPassConfigurationWizardStep();
                        break;
                    case 'files':
                        promise = this.canPassFilesWizardStep();
                        break;
                    case 'extra':
                        promise = this.canPassExtraWizardStep();
                        break;
                    case 'hash':
                        promise = this.canPassHashWizardStep();
                        break;
                    default:
                        promise = new Promise((resolve, reject) => {
                            reject(new Error('This step is not finished yet. Please fill out all required fields or make a choice of truth.'));
                        });
                        break;
                }

                promise
                    .then(() => {
                        this.wizard.valid = true;
                        this.wizard.message = undefined;
                        resolve(true);
                    })
                    .catch((e) => {
                        this.wizard.valid = false;
                        this.wizard.message = e?.message ?? e;
                        reject();
                    });
            });
        },
        async canPassConfigurationWizardStep() {
            if (this.train.master_image_id === '' || typeof this.train.master_image_id === 'undefined') {
                throw new Error('A master image must be selected...');
            }

            if (this.trainStation.items.length === 0) {
                throw new Error('Train Stations have to be specified...');
            }

            await this.updateTrain({
                master_image_id: this.train.master_image_id,
            });

            return true;
        },
        async canPassFilesWizardStep() {
            if (this.train.entrypoint_file_id === '' || !this.train.entrypoint_file_id) {
                throw new Error('An uploaded file must be selected as entrypoint.');
            }

            await this.updateTrain({ entrypoint_file_id: this.train.entrypoint_file_id });

            return true;
        },
        async canPassExtraWizardStep() {
            await this.updateTrain({
                query: this.train.query,
            });

            return true;
        },
        async canPassHashWizardStep() {
            if (this.trainProperty.hash === '' || !this.trainProperty.hash) {
                throw new Error('The hash is not generated yet or is maybe still in process.');
            }

            if (this.train.hash_signed === '' || !this.train.hash_signed) {
                throw new Error('The provided hash must be signed by the offline tool...');
            }

            await this.updateTrain({ hash_signed: this.train.hash_signed });

            return true;
        },

        prevWizardStep() {
            this.$refs.wizard.prevTab();
        },
        nextWizardStep() {
            this.$refs.wizard.nextTab();
        },

        //----------------------------------
        // actions
        //----------------------------------
        handleUpdated(item) {
            for (const key in item) {
                Vue.set(this.train, key, item[key]);
            }
        },
        setTrainFiles(files) {
            this.train.files = files;
        },
        setMasterImage(item) {
            if (item) {
                this.train.master_image_id = item.id;
                this.$refs.imageCommand.setMasterImage(item);
            } else {
                this.train.master_image_id = '';
                this.$refs.imageCommand.setMasterImage(null);
            }
        },
        setFhirQuery(query) {
            this.train.query = query;
        },
        setStations(stations) {
            this.trainStation.items = stations;
        },
        setEntrypointFile(item) {
            if (item) {
                this.train.entrypoint_file_id = item.id;
            } else {
                this.train.entrypoint_file_id = null;
            }

            this.$nextTick(() => {
                this.$refs.imageCommand.setTrainFile(item);
            });
        },
        setHash(hash) {
            const data = {
                hash,
                configuration_status: TrainConfigurationStatus.HASH_GENERATED,
            };

            for (const key in data) {
                this.train[key] = data[key];
            }

            this.$emit('updated', data);
        },
        setHashSigned(val) {
            this.train.hash_signed = val;
        },

        //----------------------------------
        // events
        //----------------------------------
        handleWizardChange(prevIndex, nextIndex) {
            this.wizard.index = nextIndex;
            this.wizard.valid = true;
            this.wizard.message = undefined;
        },

        handleFilesUploaded() {
            this.resetHashSignedStatus();
        },

        handleFilesDeleted(id) {
            this.resetHashSignedStatus(id);
        },

        resetHashSignedStatus(id) {
            const data = {
                configuration_status: null,
                hash: null,
                hash_signed: null,
            };

            if (typeof id !== 'undefined' && id === this.train.entrypoint_file_id) {
                data.entrypoint_file_id = null;
            }

            for (const key in data) {
                this.train[key] = data[key];
            }

            this.$refs['wizard-hash-step'].reset();

            this.$emit('updated', data);
        },
    },
};
</script>
<template>
    <div>
        <div v-if="isConfigured">
            <div class="alert alert-info alert-sm">
                The train is not in the configuration stage and already left the factory.
            </div>
        </div>
        <div v-else>
            <form-wizard
                ref="wizard"
                color="#333"
                title="Train Wizard"
                :subtitle="'Configure your '+trainProperty.type+' train step by step'"
                :start-index="wizard.startIndex"
                @on-change="handleWizardChange"
            >
                <template #title>
                    <h4 class="wizard-title">
                        <i class="fa fa-hat-wizard" /> Train Wizard
                    </h4>
                    <p class="category">
                        Configure your {{ trainProperty.type }} train step by step
                    </p>

                    <train-image-command
                        ref="imageCommand"
                        class="mt-2 mb-2"
                        :master-image-id-prop="train.master_image_id"
                        :train-file-id-prop="train.entrypoint_file_id"
                        :train-id-prop="trainProperty.id"
                    />
                </template>
                <template
                    slot="footer"
                    slot-scope="props"
                >
                    <div
                        v-if="canPassDefined && !wizard.valid"
                        class="alert alert-warning alert-sm"
                    >
                        Error: {{ wizardMessage }}
                    </div>
                    <div class="wizard-footer-left">
                        <wizard-button
                            v-if="props.activeTabIndex > 0 && !props.isLastStep"
                            :style="props.fillButtonStyle"
                            @click.native="prevWizardStep"
                        >
                            Back
                        </wizard-button>
                    </div>
                    <div class="wizard-footer-right">
                        <wizard-button
                            v-if="!props.isLastStep"
                            class="wizard-footer-right"
                            :style="props.fillButtonStyle"
                            @click.native="nextWizardStep"
                        >
                            Next
                        </wizard-button>

                        <wizard-button
                            v-else
                            class="wizard-footer-right finish-button"
                            :style="props.fillButtonStyle"
                        >
                            Build train
                        </wizard-button>
                    </div>
                </template>

                <tab-content
                    title="Configuration"
                    :before-change="passWizardStep"
                >
                    <train-wizard-configurator-step
                        :train="trainProperty"
                        :train-stations="trainStation.items"
                        @setTrainMasterImage="setMasterImage"
                        @setTrainStations="setStations"
                        @setTrainQuery="setFhirQuery"
                    />
                </tab-content>

                <tab-content
                    title="Files"
                    :before-change="passWizardStep"
                >
                    <train-file-manager
                        :train="train"
                        @uploaded="handleFilesUploaded"
                        @deleted="handleFilesDeleted"
                        @setEntrypointFile="setEntrypointFile"
                    />
                </tab-content>

                <tab-content
                    title="Extra"
                    :before-change="passWizardStep"
                >
                    <train-wizard-extra-step
                        :train="train"
                        @querySelected="setFhirQuery"
                    />
                </tab-content>

                <tab-content
                    title="Hash"
                    :before-change="passWizardStep"
                >
                    <train-wizard-hash-step
                        ref="wizard-hash-step"
                        :train="train"
                        @hashGenerated="setHash"
                        @setHashSigned="setHashSigned"
                    />
                </tab-content>

                <tab-content title="Finish">
                    <train-wizard-final-step />
                </tab-content>
            </form-wizard>
        </div>
    </div>
</template>
