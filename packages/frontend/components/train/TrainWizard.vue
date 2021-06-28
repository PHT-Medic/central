<script>
import TrainWizardConfiguratorStep from "@/components/train/wizard/TrainWizardConfiguratorStep";
import TrainFileManager from "@/components/train/file/TrainFileManager";
import {editTrain, runTrainTask} from "@/domains/train/api.ts";
import TrainWizardHashStep from "@/components/train/wizard/TrainWizardHashStep";
import TrainWizardFinalStep from "@/components/train/wizard/TrainWizardFinalStep";
import {TrainConfiguratorStates} from "@/domains/train/index.ts";

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
                // required attributes for child components (id, proposalId)
                id: null,
                proposalId: null,

                query: null,
                masterImageId: null,
                stationIds: [],

                entrypointFileId: null,
                entrypointExecutable: '',
                files: [],

                hashSigned: '',
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

            if(typeof this.trainProperty.trainStations !== 'undefined') {
                this.trainStation.items = this.trainProperty.trainStations;
            }
        },
        async updateTrain(data) {
            if(!this.wizard.initialized) return;

            const keys = Object.keys(data);

            if(keys.length === 0) return;

            try {
                const train = await editTrain(this.trainProperty.id, data);

                const updateData = {
                    status: train.status,
                    configuratorStatus: train.configuratorStatus,
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
                const train = await runTrainTask(this.trainProperty.id, 'build');

                this.$emit('updated', {
                    status: train.status,
                    configuratorStatus: train.configuratorStatus
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
                await this.$refs['wizard'].changeTab(0, index);
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
            if(this.form.masterImageId === '' || typeof this.form.masterImageId === 'undefined') {
                throw new Error('A master image must be selected...');
            }

            if(this.trainStation.items.length === 0) {
                throw new Error('Train Stations have to be specified...');
            }

            await this.updateTrain({
                masterImageId: this.form.masterImageId,
                query: this.form.query
            });

            return true;
        },
        async canPassFilesWizardStep() {
            if(this.form.entrypointFileId === '' || !this.form.entrypointFileId) {
                throw new Error('An uploaded file must be selected as entrypoint...');
            }

            console.log(this.form.entrypointFileId);

            if(this.form.entrypointExecutable === '' || !this.form.entrypointExecutable) {
                throw new Error('An executable for the entrypoint must be selected...');
            }

            await this.updateTrain({entrypointFileId: this.form.entrypointFileId, entrypointExecutable: this.form.entrypointExecutable});

            return true;
        },
        async canPassHashWizardStep() {
            if(this.trainProperty.hash === '' || !this.trainProperty.hash) {
                throw new Error('The hash is not generated yet or is maybe still in process.');
            }

            if(this.form.hashSigned === '' || !this.form.hashSigned) {
                throw new Error('The provided hash must be signed by the offline tool...');
            }

            await this.updateTrain({hashSigned: this.form.hashSigned});

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
            this.form.masterImageId = id;
        },
        setQuery(query) {
            this.form.query = query;
        },
        setStations(stations) {
            this.trainStation.items = stations;
        },
        setEntrypointFileId(id) {
            this.form.entrypointFileId = id;
        },
        setEntrypointExecutable(executable) {
            this.form.entrypointExecutable = executable;
        },
        setHash(hash) {
            let data = {
                hash: hash,
                configuratorStatus: TrainConfiguratorStates.TrainConfiguratorStateHashGenerated
            };

            for(let key in data) {
                this.form[key] = data[key];
            }

            console.log(this.form, hash);

            this.$emit('updated', data);
        },
        setHashSigned(hashSigned) {
            this.form.hashSigned = hashSigned;
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
                configuratorStatus: TrainConfiguratorStates.TrainConfiguratorStateOpen,
                hash: null,
                hashSigned: null
            };

            if(typeof id !== 'undefined' && id === this.form.entrypointFileId) {
                data.entrypointFileId = null;
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
            return this.trainProperty.configuratorStatus === TrainConfiguratorStates.TrainConfiguratorStateFinished;
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
