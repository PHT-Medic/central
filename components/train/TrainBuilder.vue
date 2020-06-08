<script>
    import { FormWizard, TabContent } from 'vue-form-wizard';
    import 'vue-form-wizard/dist/vue-form-wizard.min.css';

    import { integer, maxLength, minLength, required } from 'vuelidate/lib/validators';
    import MasterImageService from '../../services/edge/masterImage';

    import AlertMessage from "../../components/alert/AlertMessage";
    import {mapGetters} from "vuex";
    import UserPublicKeyEdge from "../../services/edge/user/userPublicKeyEdge";

    const TrainTypes = {
        Analyse: 'analyse',
        Discovery: 'discovery'
    }

    export default {
        components: {
            FormWizard,
            TabContent,
            AlertMessage
        },
        props: {
            proposal: {
                type: Object
            },
            proposalStationsData: {
                type: Array,
                default() {
                    return []
                }
            },

            train: {
                type: Object,
                default () {
                    return null
                }
            }
        },
        data() {
            return {
                data: {
                    public_key: null,
                    type: null,
                    startIndex: 2
                },
                message: null,

                trainTypes: TrainTypes,
                trainStations: [],
                trainStationsLoading: false,

                trainFiles: [],
                trainFilesLoading: false,

                /**
                 * Master Images
                 */
                masterImages: [],
                masterImagesLoading: false,

                /**
                 * Proposal Stations
                 */
                proposalStations: [],
                proposalStationsLoading: false,

                /**
                 * Form
                 */
                formData: {
                    masterImageId: '',
                    stationIds: [],
                    entryPointName: 'app.py',
                    entryPointFiles: [],
                },

                hashStep: {
                    message: null,
                    messageId: null,
                    percentage: 0,
                    interval: null
                }
            }
        },
        validations () {
            const validations = {};
            const formData = {};

            formData.masterImageId = {
                required,
                integer
            };

            formData.stationIds = {
                required,
                minLength: minLength(1),
                $each: {
                    required,
                    integer
                }
            };

            formData.entryPointName = {
                required,
                minLength: minLength(5),
                maxLength: maxLength(50)
            };

            validations.formData = formData;

            return validations;
        },
        async created () {
            if(!this.train || !this.canCreateAnalyseTrain()) {
                this.setIsDiscoveryTrain();
            }

            try {
                let {content} = await UserPublicKeyEdge.getKey();
                this.data.public_key = content;
            } catch (e) {

            }

            if(this.train) {
                //todo: depending on proposal status go to status or disable specific one.

                this.formData.masterImageId = this.train.master_image_id;
                this.data.type = this.train.type;
                this.trainStations = await this.getTrainStations();
            } else {
                this.formData.masterImageId = this.proposal.master_image_id;
            }

            if(this.proposalStationsData) {
                this.proposalStations = this.proposalStationsData;
            } else {
                this.proposalStationsLoading = true;
                this.proposalStations = await this.getProposalStations();
                this.proposalStationsLoading = false;
            }

            this.setProposalStationsAsSelected();

            this.masterImagesLoading = true;
            this.masterImages = await MasterImageService.getMasterImages();
            this.masterImagesLoading = false;
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),

            typeFormatted() {
                return this.data.type ? this.data.type.charAt(0).toUpperCase() + this.data.type.slice(1) : null;
            },

            canCreateDiscoveryTrain: () => {
                return true;
            },
            canCreateAnalyseTrain() {
                return this.proposal.create_analyse_train;
            },
            hashPercent() {
                return this.hashStep.percentage.toFixed();
            }
        },
        methods: {
            setProposalStationsAsSelected() {
                let stationIds = [];

                for(let i=0; i<this.proposalStations.length; i++) {
                    stationIds.push(this.proposalStations[i].id);
                }

                this.formData.stationIds = stationIds;
            },
            //--------------------------------------------------

            async getProposalStations() {
                return [];
            },
            async getTrainStations() {
                return [];
            },
            //--------------------------------------------------

            isTrainCreated () {
                return this.train;
            },

            createAlertMessage(message) {
                return this.$createElement('div', { class: 'alert alert-warning m-b-0'}, [message]);
            },

            //--------------------------------------------------


            changedWizardStep(prevIndex, nextIndex) {
                switch(nextIndex) {
                    case 2:
                        this.startHashStep();
                        break;
                }

                console.log(prevIndex, nextIndex);
            },

            /**
             * Wizard Step 1
             *
             * @param checkOnly
             * @return {boolean}
             */
            proceedToWizardStepSettings(checkOnly) {
                let trainType = this.data.type;
                let publicKey = !!this.data.public_key;

                if(trainType && publicKey) {
                    return true;
                }

                if(!checkOnly) {
                    if(!trainType) {
                        this.$bvModal.msgBoxOk(this.createAlertMessage('Es muss ein Zug Typ ausgewählt werden.'), {
                            buttonSize: 'sm',
                        });
                    }

                    if(!publicKey) {
                        this.$bvModal.msgBoxOk(this.createAlertMessage('Es muss ein PublicKey hochgeladen werden.'), {
                            buttonSize: 'sm',
                        });
                    }
                }

                return false;
            },
            /**
             * Wizard Step 2
             *
             * @param checkOnly
             * @return {boolean}
             */
            proceedToWizardStepHash(checkOnly) {
                let isValid = !this.$v.formData.$invalid;

                if(isValid) {
                    return true;
                }

                if(!checkOnly && !isValid) {
                    this.$bvModal.msgBoxOk(this.createAlertMessage('Es müssen alle Einstellungen vorgenommen werden.'),{
                        buttonSize: 'sm',
                    });
                }

                return false;
            },
            /**
             * Wizard Step 3
             *
             * @param checkOnly
             * @return {boolean}
             */
            proceedToWizardStepFinish(checkOnly) {
                let hashGenerated = this.hashPercent === '100';

                if(hashGenerated) {
                    return true;
                }

                if(!checkOnly && !hashGenerated) {
                    this.$bvModal.msgBoxOk(this.createAlertMessage('Der Hash muss generiert und anschließend validiert werden.'),{
                        buttonSize: 'sm',
                    });
                }

                return false;
            },

            canProceedWizardStep(step) {
                switch (step) {
                    case 0:
                        return this.proceedToWizardStepSettings(true);
                    case 'settings':
                        return this.proceedToWizardStepHash(true);
                    case 'hash':
                        return this.proceedToWizardStepFinish(true);
                }

                return false;
            },

            //--------------------------------------------------

            setIsDiscoveryTrain() {
                this.data.type = TrainTypes.Discovery;
            },
            isDiscoveryTrain() {
                return this.data.type === TrainTypes.Discovery;
            },

            setIsAnalyseTrain() {
                this.data.type = TrainTypes.Analyse;
            },
            isAnalyseTrain() {
                return this.data.type === TrainTypes.Analyse;
            },

            //----------------------------------------------------

            checkFiles(event) {
                event.preventDefault();

                let formData = new FormData();

                for(let i=0; i < event.target.files.length; i++) {
                    let file = event.target.files[i];

                    this.formData.entryPointFiles.push(file);
                }
            },

            //----------------------------------------------------

            startHashStep() {
                this.startProgress();
            },

            stopProgress() {
                if(!this.hashStep.interval) return;

                clearInterval(this.hashStep.interval);
            },
            startProgress() {
                if(this.hashStep.interval) return;

                this.hashStep.interval = setInterval(() => {
                    if(this.hashStep.percentage < 100) {
                        /*
                        1. Generating Train
                        2. Uploading Files
                        3. Building Hash over Files
                         */
                        if(this.hashStep.percentage.toFixed() === '0') {
                            this.hashStep.message = 'Zug wird konfiguriert...';
                        } else if(this.hashStep.percentage.toFixed() === '30') {
                            this.hashStep.message = 'Dateien werden hochgeladen...';
                        } else if(this.hashStep.percentage.toFixed() === '60') {
                            this.hashStep.message = 'Ein Hash wird über die Konfiguration gebaut...';
                        }
                        this.hashStep.percentage += .1;
                    } else {
                        this.hashStep.message = 'Fertig.';
                        this.stopProgress();
                    }
                }, 10);
            }
        }
    }
</script>
<template>
    <div>
        <form>
            <alert-message :message="message" />
            <form-wizard
                @on-change="changedWizardStep"
                ref="trainWizard"
                color="#333"
                :title="(data.type ? typeFormatted+'-' : '') + 'Zug'"
                subtitle="Erstellen"
                back-button-text="Zurück"
                next-button-text="Weiter"
                finish-button-text="Ende"
                :start-index="data.startIndex"
            >
                <tab-content title="Type" :before-change="proceedToWizardStepSettings">
                    <div v-if="!data.public_key" class="alert alert-info m-b-20">
                        Es muss ein PublicKey in den <nuxt-link :to="'/settings/security'"><i class="fa fa-cog"></i> Einstellungen</nuxt-link> hochgeladen werden.
                    </div>

                    <b-card no-body class="m-b-20">
                        <b-tabs pills card vertical>
                            <b-tab title="Discovery" :active="isDiscoveryTrain()" :disabled="!canCreateDiscoveryTrain" @click="setIsDiscoveryTrain">
                                <b-card-text>
                                    Starte einen Discovery Zug, um zu erfahren wie viele Daten augrund der angefoderten Parameter in den Krankenhäuser verfügbar sind.
                                </b-card-text>
                            </b-tab>
                            <b-tab title="Analyse" :active="isAnalyseTrain()" :disabled="!canCreateAnalyseTrain" @click="setIsAnalyseTrain">
                                <b-card-text>
                                    Starte einen Analyse auf Basis der zugrunde liegenden Ergebnisse des Discovery Zuges.
                                </b-card-text>
                            </b-tab>
                        </b-tabs>
                    </b-card>
                </tab-content>
                <tab-content title="Einstellungen" :before-change="proceedToWizardStepHash">
                    <div class="form-group" :class="{ 'form-group-error': $v.formData.masterImageId.$error }">
                        <label>Master Image</label>
                        <select v-model="$v.formData.masterImageId.$model" class="form-control" :disabled="masterImagesLoading">
                            <option value="">
                                --Auswählen--
                            </option>
                            <option v-for="(item,key) in masterImages" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>

                        <div v-if="!$v.formData.masterImageId.required" class="form-group-hint group-required">
                            Bitte wählen Sie ein Master Image aus, dass diesem Zug zugrunde liegt.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.stationIds.$anyError }">
                        <label>Krankenhäuser</label>
                        <select v-model="$v.formData.stationIds.$model" class="form-control" multiple :disabled="proposalStationsLoading || trainStationsLoading">
                            <option v-for="(item,key) in proposalStations" :key="key" :value="item.id" :selected="item.included">
                                {{ item.name }}
                            </option>
                        </select>
                        <div v-if="!$v.formData.stationIds.required" class="form-group-hint group-required">
                            Bitte wählen Sie eines oder mehere Krankenhäuser aus ihrem Antrag aus.
                        </div>
                        <div v-if="!$v.formData.stationIds.minLength" class="form-group-hint">
                            Es muss mindestens <strong>{{ $v.formData.stationIds.$params.minLength.min }}</strong> Krankenhaus/er ausgewählt werden.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group">
                        <label>EntryPoint Name</label>
                        <input v-model="$v.formData.entryPointName.$model" type="text" class="form-control" placeholder="...">
                        <div v-if="!$v.formData.entryPointName.required" class="form-group-hint group-required">
                            Bitte geben Sie einen Entrypoint Namen an.
                        </div>
                        <div v-if="!$v.formData.entryPointName.minLength" class="form-group-hint">
                            Der EntryPoint muss mindestens <strong>{{ $v.formData.entryPointName.$params.minLength.min }}</strong> Zeichen lang sein.
                        </div>
                        <div v-if="!$v.formData.entryPointName.minLength" class="form-group-hint">
                            Der EntryPoint darf maximal <strong>{{ $v.formData.entryPointName.$params.minLength.min }}</strong> Zeichen lang sein.
                        </div>
                    </div>

                    <hr>

                    <div class="form-group">
                        <label>EntryPoint Dateien</label>
                        <div class="custom-file">
                            <input type="file" ref="entrypointFiles" class="custom-file-input" id="customFile" @change="checkFiles" multiple>
                            <label class="custom-file-label" for="customFile">Dateien auswählen...</label>
                        </div>

                        <div class="flex flex-row flex-wrap m-t-10">
                            <button v-for="(item,key) in formData.entryPointFiles" class="btn btn-primary btn-xs rounded" style="margin: 0 5px 5px 0;">
                                {{item.name}} ({{item.size}} Bytes)
                            </button>
                        </div>
                    </div>
                </tab-content>
                <tab-content title="Hash/Signierung" :before-change="proceedToWizardStepFinish">
                    <div v-if="train">
                        <div v-if="train.hash" class="form-group">
                            <label>Hash</label>
                            <input type="text" class="form-group" v-model="train.hash" :disabled="true" />
                        </div>
                    </div>
                    <div v-if="!train">
                        <div class="alert-dark alert alert-sm">
                            <span class="text-dark font-weight-bold" style="margin-right: 5px">{{ hashPercent }}%</span> {{hashStep.message}}
                            <div class="float-right">
                                <b-spinner small label="Small Spinner" v-if="hashPercent !== '100'"></b-spinner>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center align-items-center">

                        </div>
                    </div>

                </tab-content>
                <tab-content title="Ende">
                    <div class="alert alert-sm alert-success">
                        Der Zug wurde erfolgreich erstellt und macht jetzt seine Reise ;) ...
                    </div>
                </tab-content>
            </form-wizard>
        </form>
    </div>
</template>
