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
} from '@personalhealthtrain/ui-common';
import TrainWizardStepBase from './TrainWizardStepBase';
import TrainFileManager from '../../train-file/TrainFileManager';
import TrainWizardStepHash from './TrainWizardStepHash';
import TrainWizardStepFinal from './TrainWizardStepFinal';
import TrainWizardStepQuery from './TrainWizardStepQuery';
import TrainWizardStepSecurity from './TrainWizardStepSecurity';

export default {
    components: {
        TrainWizardStepSecurity,
        TrainWizardStepQuery,
        TrainWizardStepFinal,
        TrainWizardStepHash,
        TrainFileManager,
        TrainWizardStepBase,
    },
    props: {
        entity: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            wizard: {
                initialized: false,
                valid: undefined,

                startIndex: 0,
                index: 0,
                steps: [
                    'configuration',
                    'security',
                    'files',
                    'extra',
                    'hash',
                    'finish',
                ],
            },
            form: {
                query: null,
                master_image_id: null,
                station_ids: [],

                user_rsa_secret_id: null,
                user_paillier_secret_id: null,

                entrypoint_file_id: null,
                files: [],

                hash_signed: '',
                hash: null,
            },
            trainInitializing: false,
            busy: false,
        };
    },
    computed: {
        isConfigured() {
            return this.entity.configuration_status === TrainConfigurationStatus.FINISHED;
        },

        trainId() {
            return this.entity.id;
        },
        trainUpdatedAt() {
            return this.entity.updated_at;
        },
    },
    watch: {
        trainUpdatedAt(val, oldVal) {
            if (val && val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        if (this.isConfigured) return;

        this.initFromProperties();

        Promise.resolve()
            .then(this.initWizard);
    },
    methods: {
        //----------------------------------
        // Train
        //----------------------------------
        initFromProperties() {
            if (
                typeof this.entity === 'undefined' ||
                this.trainInitializing
            ) return;

            this.trainInitializing = true;

            const keys = Object.keys(this.form);
            for (let i = 0; i < keys.length; i++) {
                if (Object.prototype.hasOwnProperty.call(this.entity, keys[i])) {
                    this.form[keys[i]] = this.entity[keys[i]];
                }
            }

            this.trainInitializing = false;
        },

        async update(data) {
            if (!this.wizard.initialized) return;

            const keys = Object.keys(data);

            if (keys.length === 0) return;

            const item = await this.$api.train.update(this.entity.id, data);
            this.handleUpdated(item);
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
                    case 'security':
                        promise = this.canPassSecurityWizardStep();
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
                        resolve(true);
                    })
                    .catch((e) => {
                        if (e instanceof Error) {
                            this.$bvToast.toast(e.message, {
                                variant: 'warning',
                                toaster: 'b-toaster-top-center',
                            });
                        }
                        reject();
                    });
            });
        },
        async canPassConfigurationWizardStep() {
            if (!this.form.master_image_id || this.form.master_image_id.length === 0) {
                throw new Error('A master image must be selected...');
            }

            if (this.entity.stations <= 0) {
                throw new Error('One or more stations have to be selected...');
            }

            await this.update({
                master_image_id: this.form.master_image_id,
            });

            return true;
        },
        async canPassSecurityWizardStep() {
            if (!this.form.user_rsa_secret_id) {
                throw new Error('A RSA key must be selected...');
            }

            return true;
        },
        async canPassFilesWizardStep() {
            if (!this.form.entrypoint_file_id || this.form.entrypoint_file_id.length === 0) {
                throw new Error('An uploaded file must be selected as entrypoint.');
            }

            await this.update({ entrypoint_file_id: this.form.entrypoint_file_id });

            return true;
        },
        async canPassExtraWizardStep() {
            await this.update({
                query: this.form.query,
            });

            return true;
        },
        async canPassHashWizardStep() {
            if (
                !this.form.hash ||
                this.form.hash.length === 0
            ) {
                throw new Error('The hash is not generated yet or is maybe still in process.');
            }

            if (
                !this.form.hash_signed ||
                this.form.hash_signed.length === 0
            ) {
                throw new Error('The provided hash must be signed with the desktop app...');
            }

            await this.update({ hash_signed: this.form.hash_signed });

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
            this.$emit('updated', item);
        },
        handleFormUpdated(item) {
            const keys = Object.keys(item);

            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.form, keys[i], item[keys[i]]);
            }
        },
        setMasterImage(item) {
            this.handleFormUpdated({ master_image_id: item ? item.id : null });
        },
        setFhirQuery(query) {
            this.handleFormUpdated({ query });
        },
        setEntrypointFile(item) {
            this.handleFormUpdated({ entrypoint_file_id: item ? item.id : null });
        },
        setHash(hash) {
            this.handleFormUpdated({ hash });
        },
        setHashSigned(val) {
            this.handleFormUpdated({ hash_signed: val });
        },

        //----------------------------------
        // events
        //----------------------------------
        handleWizardChange(prevIndex, nextIndex) {
            this.wizard.index = nextIndex;
            this.wizard.valid = true;
        },

        handleFilesUploaded() {
            this.$refs['wizard-hash-step'].reset();
        },
        handleFilesDeleted() {
            this.$refs['wizard-hash-step'].reset();
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
                :subtitle="'Configure your '+entity.type+' train step by step'"
                :start-index="wizard.startIndex"
                @on-change="handleWizardChange"
            >
                <template #title>
                    <h4 class="wizard-title">
                        <i class="fa fa-hat-wizard" /> Train Wizard
                    </h4>
                    <p class="category">
                        Configure your {{ entity.type }} train step by step
                    </p>
                </template>
                <template
                    slot="footer"
                    slot-scope="props"
                >
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
                    title="Base"
                    :before-change="passWizardStep"
                >
                    <train-wizard-step-base
                        :train="entity"
                        @setTrainMasterImage="setMasterImage"
                        @updated="handleUpdated"
                    />
                </tab-content>

                <tab-content
                    title="Security"
                    :before-change="passWizardStep"
                >
                    <train-wizard-step-security
                        :train="entity"
                        @updated="handleUpdated"
                    />
                </tab-content>

                <tab-content
                    title="Files"
                    :before-change="passWizardStep"
                >
                    <train-file-manager
                        :train="entity"
                        @uploaded="handleFilesUploaded"
                        @deleted="handleFilesDeleted"
                        @setEntrypointFile="setEntrypointFile"
                    />
                </tab-content>

                <tab-content
                    title="Extra"
                    :before-change="passWizardStep"
                >
                    <train-wizard-step-query
                        :train="entity"
                        @querySelected="setFhirQuery"
                    />
                </tab-content>

                <tab-content
                    title="Hash"
                    :before-change="passWizardStep"
                >
                    <train-wizard-step-hash
                        ref="wizard-hash-step"
                        :train="entity"
                        @generated="setHash"
                        @signed="setHashSigned"
                    />
                </tab-content>

                <tab-content title="Finish">
                    <train-wizard-step-final />
                </tab-content>
            </form-wizard>
        </div>
    </div>
</template>
