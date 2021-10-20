<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    editAPITrain,
    runAPITrainCommand,
    TrainCommand,
    TrainConfigurationStatus
} from "@personalhealthtrain/ui-common";
import TrainWizardConfiguratorStep from "./wizard/TrainWizardConfiguratorStep";
import TrainFileManager from "./file/TrainFileManager";
import TrainWizardHashStep from "./wizard/TrainWizardHashStep";
import TrainWizardFinalStep from "./wizard/TrainWizardFinalStep";

export default {
    components: {TrainWizardFinalStep, TrainWizardHashStep, TrainFileManager, TrainWizardConfiguratorStep},
    props: {
        trainProperty: {
            type: Object,
            default: undefined
        }
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
                    'hash',
                    'finish'
                ]
            },
            form: {
                // required attributes for child components (id, proposal_id)
                id: null,
                proposal_id: null,

                query: null,
                master_image_id: null,
                station_ids: [],

                entrypoint_file_id: null,
                entrypoint_executable: '',
                files: [],

                hash_signed: '',
                hash: null
            },
            trainStation: {
                items: []
            },
            busy: false
        }
    },
    created() {
        this.init();
    },
    methods: {
        //----------------------------------
        // init
        //----------------------------------
        async init() {
            if(this.isConfigured) return;

            this.initTrain();
            this.initWizard().then(r => r);
        },
        initTrain() {
            if(typeof this.trainProperty === 'undefined') return;

            for (let key in this.form) {
                if(!this.trainProperty.hasOwnProperty(key)) continue;

                this.form[key] = this.trainProperty[key];
            }

            if(typeof this.trainProperty.train_stations !== 'undefined') {
                this.trainStation.items = this.trainProperty.train_stations;
            }
        },
        async updateTrain(data) {
            if(!this.wizard.initialized) return;

            const keys = Object.keys(data);

            if(keys.length === 0) return;

            try {
                const train = await editAPITrain(this.trainProperty.id, data);

                const updateData = {
                    configuration_status: train.configuration_status,
                    ...data
                };

                this.$emit('updated', updateData);
            } catch (e) {
                throw e;
            }
        },
        async buildTrain() {
            if(!this.wizard.initialized || this.busy) return;

            this.busy = true;

            try {
                const train = await runAPITrainCommand(this.trainProperty.id, TrainCommand.BUILD_START);

                this.$emit('updated', {
                    configuration_status: train.configuration_status
                });
            } catch (e) {

            }

            this.busy = false;
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

                if(index >= this.wizard.steps.length) {
                    canPass = false;
                }
            }

            if(process.server) {
                this.startIndex = index;
            } else {
                this.$refs['wizard'].changeTab(0, index);
            }

            this.wizard.initialized = true;
        },

        passWizardStep() {
            return new Promise((resolve, reject) => {
                const step = this.wizard.steps[this.wizard.index];
                let promise;

                switch (step) {
                    case 'configuration':
                        promise = this.canPassConfigurationWizardStep()
                        break;
                    case 'files':
                        promise = this.canPassFilesWizardStep();
                        break;
                    case 'hash':
                        promise = this.canPassHashWizardStep();
                        break;
                    default:
                        promise = new Promise((resolve, reject) => reject('This is step is not finished yet. Please fill out all required fields or make a choice of truth.'));
                        break;
                }

                return promise
                    .then(() => {
                        this.wizard.valid = true;
                        this.wizard.message = undefined;
                        resolve(true)
                    })
                    .catch((e) => {
                        this.wizard.valid = false;
                        this.wizard.message = e?.message ?? e;
                        reject()
                    });
            });
        },
        async canPassConfigurationWizardStep() {
            if(this.form.master_image_id === '' || typeof this.form.master_image_id === 'undefined') {
                throw new Error('A master image must be selected...');
            }

            if(this.trainStation.items.length === 0) {
                throw new Error('Train Stations have to be specified...');
            }

            await this.updateTrain({
                master_image_id: this.form.master_image_id,
                query: this.form.query
            });

            return true;
        },
        async canPassFilesWizardStep() {
            if(this.form.entrypoint_file_id === '' || !this.form.entrypoint_file_id) {
                throw new Error('An uploaded file must be selected as entrypoint...');
            }

            console.log(this.form.entrypoint_file_id);

            if(this.form.entrypoint_executable === '' || !this.form.entrypoint_executable) {
                throw new Error('An executable for the entrypoint must be selected...');
            }

            await this.updateTrain({entrypoint_file_id: this.form.entrypoint_file_id, entrypoint_executable: this.form.entrypoint_executable});

            return true;
        },
        async canPassHashWizardStep() {
            if(this.trainProperty.hash === '' || !this.trainProperty.hash) {
                throw new Error('The hash is not generated yet or is maybe still in process.');
            }

            if(this.form.hash_signed === '' || !this.form.hash_signed) {
                throw new Error('The provided hash must be signed by the offline tool...');
            }

            await this.updateTrain({hash_signed: this.form.hash_signed});

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
        setTrainFiles(files) {
            console.log(files);

            this.form.files = files;
        },
        setMasterImage(id) {
            this.form.master_image_id = id;
        },
        setQuery(query) {
            this.form.query = query;
        },
        setStations(stations) {
            this.trainStation.items = stations;
        },
        setEntrypointFileId(id) {
            this.form.entrypoint_file_id = id;
        },
        setEntrypointExecutable(executable) {
            this.form.entrypoint_executable = executable;
        },
        setHash(hash) {
            let data = {
                hash: hash,
                configuration_status: TrainConfigurationStatus.HASH_GENERATED
            };

            for(let key in data) {
                this.form[key] = data[key];
            }

            this.$emit('updated', data);
        },
        setHashSigned(hash_signed) {
            this.form.hash_signed = hash_signed;
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
            let data = {
                configuration_status: null,
                hash: null,
                hash_signed: null
            };

            if(typeof id !== 'undefined' && id === this.form.entrypoint_file_id) {
                data.entrypoint_file_id = null;
            }

            for(let key in data) {
                this.form[key] = data[key];
            }

            this.$refs['wizard-hash-step'].reset();

            this.$emit('updated', data);
        }
    },
    computed: {
        canPassDefined() {
            return typeof this.wizard.valid !== 'undefined';
        },
        wizardMessage() {
            if(typeof this.wizard.message !== 'undefined') {
                return this.wizard.message;
            }

            return '';
        },
        isConfigured() {
            return this.trainProperty.configuration_status === TrainConfigurationStatus.FINISHED;
        }
    }
}
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
                @on-change="handleWizardChange"
                ref="wizard"
                color="#333"
                title="Train Wizard"
                :subtitle="'Configure your '+trainProperty.type+' train step by step'"
                :start-index="wizard.startIndex"
            >
                <template slot="footer" slot-scope="props">
                    <!--
                    <div v-if="canPassDefined && !wizard.valid" class="alert alert-warning alert-sm">
                        Error: {{wizardMessage}}
                    </div>
                    -->
                    <div class="wizard-footer-left">
                        <wizard-button v-if="props.activeTabIndex > 0 && !props.isLastStep" @click.native="prevWizardStep" :style="props.fillButtonStyle">Back</wizard-button>
                    </div>
                    <div class="wizard-footer-right">
                        <wizard-button v-if="!props.isLastStep" @click.native="nextWizardStep" class="wizard-footer-right" :style="props.fillButtonStyle">Next</wizard-button>

                        <wizard-button v-else @click.native="buildTrain" class="wizard-footer-right finish-button" :style="props.fillButtonStyle">Build train</wizard-button>
                    </div>
                </template>

                <tab-content title="Configuration" :before-change="passWizardStep">
                    <train-wizard-configurator-step
                        :train="form"
                        :train-stations="trainStation.items"
                        @setTrainMasterImage="setMasterImage"
                        @setTrainStations="setStations"
                        @setTrainQuery="setQuery"
                    />
                </tab-content>

                <tab-content title="Files" :before-change="passWizardStep">
                    <train-file-manager
                        :train="form"
                        @uploaded="handleFilesUploaded"
                        @deleted="handleFilesDeleted"
                        @setEntrypointFile="setEntrypointFileId"
                        @setEntrypointExecutable="setEntrypointExecutable"
                    />
                </tab-content>

                <tab-content title="Hash" :before-change="passWizardStep">
                    <train-wizard-hash-step
                        ref="wizard-hash-step"
                        :train="form"
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
