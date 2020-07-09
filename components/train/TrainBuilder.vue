<script>
    import {integer, maxLength, minLength, required} from 'vuelidate/lib/validators';
    import MasterImageService from '../../services/edge/masterImage';

    import AlertMessage from "../../components/alert/AlertMessage";
    import {mapGetters} from "vuex";
    import UserPublicKeyEdge from "../../services/edge/user/userPublicKeyEdge";
    import ProposalStationEdge from "../../services/edge/proposal/proposalStationEdge";
    import TrainEdge, {TrainStates} from "../../services/edge/train/trainEdge";
    import {empty} from "../../.nuxt/utils";
    import TrainFileEdge from "../../services/edge/train/trainFileEdge";

    const TrainTypes = {
        Analyse: 'analyse',
        Discovery: 'discovery'
    }

    export default {
        components: {
            AlertMessage
        },
        props: {
            proposal: {
                type: Object
            },
            proposalStations: {
                type: Array,
                default() {
                    return []
                }
            },

            trainReference: {
                type: Object,
                default () {
                    return null
                }
            }
        },
        data() {
            return {
                busy: false,
                train: null,

                trainTypes: TrainTypes,
                trainStates: TrainStates,

                trainAction: {
                    item: null,
                    busy: false
                },
                trainStation: {
                    items: [],
                    busy: false
                },

                trainFiles: {
                    items: [],
                    busy: false
                },

                /**
                 * Master Images
                 */
                masterImage: {
                    items: [],
                    busy: false
                },

                /**
                 * Proposal Stations
                 */
                proposalStation: {
                    items: [],
                    busy: false
                },

                userPublicKey: null,
                wizard: {
                    startIndex: 0
                },

                /**
                 * Form
                 */
                formInfo: {
                    signedHashMessage: null,
                    signedHashSaved: false,
                    signedHashInProgress: false,

                    trainPushInProgress: false,
                    trainFilesSyncInProgress: false
                },
                formData: {
                    type: null,
                    masterImageId: '',
                    stationIds: [],
                    entryPointName: 'entrypoint.py',
                    entryPointFiles: [],
                    signedHash: ''
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
        created () {
            this.initWizard();
            this.initForm();
        },
        methods: {
            // Rest & Socket Methods
            async _getTrain(id) {
                if(this.busy) return;

                this.busy = true;

                try {
                    this.train = await TrainEdge.getTrain(id);
                } catch (e) {
                    this.busy = false;
                    this._closeBuilder();
                }

                this.busy = false;
            },

            async _addTrain(data) {
                if(this.busy) return;

                this.busy = true;

                try {
                    data = Object.assign({}, data);
                    data.proposalId = this.proposal.id;

                    let { id } = await TrainEdge.addTrain(data);

                    this.busy = false;
                    await this._getTrain(id);

                    this.$emit('add-train', this.train);
                } catch (e) {
                    this.busy = false;

                    throw new Error(e.message);
                }
            },

            async _editTrain(data) {
                if(this.busy) return;

                this.busy = true;

                try {
                    await TrainEdge.editTrain(this.train.id, data);

                    this.$emit('edit-train', {
                        id: this.train.id,
                        data
                    });
                } catch (e) {
                    this.busy = false;

                    throw new Error(e.message);
                }

                this.busy = false;
            },

            async _doTrainAction(action) {
                if(this.trainAction.busy) return;

                this.trainAction.busy = true;

                try {
                    this.trainAction.item = await TrainEdge.doTrainAction(this.train.id, action);

                } catch (e) {
                    await this.$bvModal.msgBoxOk(this.createAlertMessage(e.message), {
                        buttonSize: 'sm',
                    });

                    this.trainAction.busy = false;

                    throw new Error(e.message);
                }

                this.trainAction.busy = false;
            },

            //--------------------------------------------------

            async _getMasterImages() {
                if(this.masterImage.busy) return;

                this.masterImage.busy = true;

                try {
                    this.masterImage.items = await MasterImageService.getMasterImages();
                } catch (e) {
                    console.log(e);
                }

                this.masterImage.busy = false;
            },

            //--------------------------------------------------

            async _getProposalStations() {
                if(this.proposalStation.busy) return;

                this.proposalStation.busy = true;

                try {
                    this.proposalStation.items = await ProposalStationEdge.getStations();
                } catch (e) {
                    console.log(e);
                }

                this.masterImage.busy = false;
            },

            //--------------------------------------------------

            async _getTrainFiles() {
                if(this.trainFiles.busy) return;

                this.trainFiles.busy = true;

                try {
                    if(this.train) {
                        this.trainFiles.items = await TrainFileEdge.getFiles(this.train.id);
                    } else {
                        this.trainFiles.items = [];
                    }
                } catch (e) {
                    this.trainFiles.items = [];
                    throw new Error(e.message);
                }

                this.trainFiles.busy = false;
            },
            async _dropTrainFile(id) {
                if(this.trainFiles.busy) return;

                this.trainFiles.busy = true;

                try {
                    await TrainFileEdge.dropFile(this.train.id, id);

                    let index = this.trainFiles.items.findIndex((item) => item.id === id);
                    this.trainFiles.items.splice(index,1);
                } catch (e) {
                    throw new Error(e.message);
                }

                this.trainFiles.busy = false;
            },
            async _uploadTrainFiles(files) {
                if(this.trainFiles.busy || !this.train) return;

                this.trainFiles.busy = true;

                let formData = new FormData();

                for(let i=0; i < files.length; i++) {
                    let file = files[i];
                    formData.append('files['+i+']', file);
                }

                try {
                    await TrainFileEdge.uploadFiles(this.train.id, formData);
                } catch (e) {
                    throw new Error(e.message);
                }

                this.trainFiles.busy = false;
            },

            //--------------------------------------------------

            _closeBuilder() {
                this.$emit('close-builder');
            },
            closeBuilder(event) {
                event.preventDefault();

                this._closeBuilder();
            },

            async initWizard() {
                if(this.trainReference) {
                    this.train = this.trainReference;

                    if(this.isTrainCreated) {
                        let train = Object.assign({}, this.train);

                        this.formData.type = train.type;
                        this.formData.masterImageId = train.masterImageId;
                        this.formData.stationIds = train.stationIds;
                        this.formData.entryPointName = train.entryPointName;
                        this.formData.signedHash = train.signedHash;

                        if(this.formData.signedHash) {
                            this.formInfo.signedHashSaved = true;
                        }

                        switch (train.status) {
                            case TrainStates.TrainStateCreated:
                                this.wizard.startIndex = 1;
                                //this.$refs.trainWizard.changeTab(0,1);
                                break;
                            case TrainStates.TrainStateHashGenerated:
                                this.wizard.startIndex = 3;
                                //this.$refs.trainWizard.changeTab(0,3);
                                break;
                            case TrainStates.TrainStateHashSigned:
                                this.wizard.startIndex = 4;
                                this.$refs.trainWizard.changeTab(0,4);
                                break;

                        }

                        // todo: entrypoint files
                    }
                } else {
                    this.setIsDiscoveryTrain();
                }
            },
            async initForm() {
                // Public Key
                UserPublicKeyEdge.getKey().then((publicKey) => {
                    this.userPublicKey = publicKey;
                }).catch((e) => {

                });

                // Proposal Stations
                if(this.proposalStations) {
                    this.proposalStation.items = this.proposalStations;
                } else {
                    await this._getProposalStations();
                }

                await this._getMasterImages();

                await this._getTrainFiles();

                if(this.train) {
                    //todo: depending on proposal status go to status or disable specific one.
                    this.formData.masterImageId = this.train.masterImageId;
                    this.formData.stationIds = this.train.stationIds;
                    this.formData.type = this.train.type;
                } else {
                    this.formData.masterImageId = this.proposal.masterImageId;
                    this.formData.stationIds = this.proposalStation.items.map((item) => item.id);
                }
            },

            //--------------------------------------------------

            createAlertMessage(message) {
                return this.$createElement('div', { class: 'alert alert-warning m-b-0'}, [message]);
            },

            //--------------------------------------------------


            changedWizardStep(prevIndex, nextIndex) {
                switch(nextIndex) {
                    case 2:
                        this.startSummaryStep();
                        break;
                    case 3:
                        this.startHashStep();
                        break;
                }
            },

            /**
             * Wizard Step 1
             *
             * @param checkOnly
             * @return {boolean}
             */
            proceedToWizardStepSettings(checkOnly) {
                let trainType = this.formData.type;
                let publicKey = !!this.userPublicKey;

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
            proceedToWizardStepSummary(checkOnly) {
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
            proceedToWizardStepHash(checkOnly) {
                let isValid = !this.$v.formData.$invalid;

                if(isValid) {
                    this.formInfo.signedHashSaved = false;
                    this.formInfo.signedHashInProgress = false;
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
             * Wizard Step 4
             *
             * @param checkOnly
             * @return {boolean}
             */
            proceedToWizardStepFinish(checkOnly) {
                let hashGenerated = true;
                let errorMessage = null;

                if(!this.train.hash || empty(this.train.hash)) {
                    hashGenerated = false;
                    errorMessage = 'Es muss zunächst ein Hash generiert werden, der anschließend noch signiert werden muss.'
                }

                if(!this.formData.signedHash || empty(this.formData.signedHash)) {
                    hashGenerated = false;
                    errorMessage = 'Es muss ein signierter Hash angegeben werden.';
                }

                if(!this.formInfo.signedHashSaved) {
                    hashGenerated = false;
                    errorMessage = 'Der signierte Hash muss gespeichert werden.';
                }

                if(hashGenerated) {
                    return true;
                }

                if(!checkOnly && !hashGenerated) {
                    this.$bvModal.msgBoxOk(this.createAlertMessage(errorMessage),{
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
                this.formData.type = TrainTypes.Discovery;
            },
            setIsAnalyseTrain() {
                this.formData.type = TrainTypes.Analyse;
            },
            async pushTrain() {
                if(this.formInfo.trainPushInProgress) return;

                this.trainPushInProgress = true;

                try {
                    if (this.isTrainCreated) {
                        await this._editTrain({
                            masterImageId: this.formData.masterImageId,
                            stationIds: this.formData.stationIds,
                            entryPointName: this.formData.entryPointName
                        });

                        this.$emit('edit-train', {
                            id: this.train.id,
                            data: {
                                status: this.trainStates.TrainStateCreated
                            }
                        });
                    } else {
                        await this._addTrain({
                            type: this.formData.type,
                            masterImageId: this.formData.masterImageId,
                            stationIds: this.formData.stationIds,
                            entryPointName: this.formData.entryPointName,
                        });
                    }
                } catch (e) {
                    await this.$bvModal.msgBoxOk(this.createAlertMessage(e.message), {
                        buttonSize: 'sm',
                    });
                }

                this.trainPushInProgress = false;
            },

            //----------------------------------------------------

            async dropTrainFile(event,id) {
                event.preventDefault();

                try {
                    await this._dropTrainFile(id);
                } catch (e) {

                }
            },

            //----------------------------------------------------

            checkEntrypointFiles(event) {
                event.preventDefault();

                for(let i=0; i < event.target.files.length; i++) {
                    let file = event.target.files[i];

                    this.formData.entryPointFiles.push(file);
                }
            },
            dropEntryPointFile(event, index) {
                event.preventDefault();

                this.formData.entryPointFiles.splice(index,1);
            },

            //----------------------------------------------------

            async pushFiles() {
                if(this.formInfo.trainFilesSyncInProgress) return;

                this.formInfo.trainFilesSyncInProgress = true;

                let files = this.formData.entryPointFiles;

                try {
                    await this._uploadTrainFiles(files);
                    this.$refs.entryPointFiles.value = '';
                    this.formData.entryPointFiles = [];

                    await this._getTrainFiles();
                } catch (e) {
                    await this.$bvModal.msgBoxOk(this.createAlertMessage(e.message), {
                        buttonSize: 'sm',
                    });

                    this.formInfo.trainFilesSyncInProgress = false;

                    throw new Error(e.message);
                }

                this.formInfo.trainFilesSyncInProgress = false;
            },

            //----------------------------------------------------

            async saveSignedHash() {
                if(this.formInfo.signedHashInProgress) return;

                this.formInfo.signedHashInProgress = true;
                this.formInfo.signedHashSaved = false;
                this.formInfo.signedHashMessage = null;

                try {
                    await this._editTrain({
                        signedHash: this.formData.signedHash
                    });

                    this.$emit('edit-train', {
                        id: this.train.id,
                        data: {
                            status: this.trainStates.TrainStateHashSigned
                        }
                    });

                    this.formInfo.signedHashSaved = true;
                } catch (e) {
                    this.formInfo.signedHashMessage = {
                        isError: true,
                        data: 'Der signierte Hash konnte nicht gespeichert werden.'
                    }
                }

                this.formInfo.signedHashInProgress = false;
            },

            //----------------------------------------------------

            async startSummaryStep() {
                if(this.isTrainEditAble) {
                    try {
                        await this.pushTrain();
                        await this.pushFiles();
                    } catch (e) {
                        return this.$refs.trainWizard.prevTab();
                    }
                }
            },
            async startHashStep() {
                try {
                    await this._doTrainAction('generateHash');

                    if(this.trainAction.item.hasOwnProperty('hash')) {
                        this.train.hash = this.trainAction.item.hash;

                        this.$emit('edit-train', {
                            id: this.train.id,
                            data: {
                                status: this.trainStates.TrainStateHashGenerated
                            }
                        });
                    } else {
                        throw new Error();
                    }
                } catch (e) {
                    return this.$refs.trainWizard.prevTab();
                }
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),
            typeFormatted() {
                return this.formData.type ? this.formData.type.charAt(0).toUpperCase() + this.formData.type.slice(1) : null;
            },

            //---------------------------------
            canCreateDiscoveryTrain(vm) {
                return !vm.isTrainCreated || this.train.type === TrainTypes.Discovery;
            },
            canCreateAnalyseTrain(vm) {
                return !vm.isTrainCreated || this.train.type === TrainTypes.Analyse;
            },

            isDiscoveryTrain() {
                return this.formData.type === TrainTypes.Discovery;
            },
            isAnalyseTrain() {
                return this.formData.type === TrainTypes.Analyse;
            },

            isTrainCreated() {
                return !!this.train;
            },
            isTrainEditAble() {
                return !this.isTrainCreated || [TrainStates.TrainStateCreated, TrainStates.TrainStateHashSigned, TrainStates.TrainStateHashGenerated, TrainStates.TrainStateFinished].indexOf(this.train.status) > -1;
            }
        }
    }
</script>
<template>
    <div>
        <form>
            <form-wizard
                @on-change="changedWizardStep"
                ref="trainWizard"
                color="#333"
                :title="(formData.type ? typeFormatted+'-' : '') + 'Zug'"
                subtitle="Erstellen"
                back-button-text="Zurück"
                next-button-text="Weiter"
                finish-button-text="Ende"
                :start-index="wizard.startIndex"
            >
                <template slot="footer" slot-scope="props">
                    <div class="wizard-footer-left">
                        <wizard-button  v-if="props.activeTabIndex > 0 && !props.isLastStep" @click.native="props.prevTab()" :style="props.fillButtonStyle">Zurück</wizard-button>
                    </div>
                    <div class="wizard-footer-right">
                        <wizard-button v-if="!props.isLastStep" @click.native="props.nextTab()" class="wizard-footer-right" :style="props.fillButtonStyle">Weiter </wizard-button>

                        <wizard-button v-else @click.native="closeBuilder" class="wizard-footer-right finish-button" :style="props.fillButtonStyle">Fertig</wizard-button>
                    </div>
                </template>
                <tab-content title="Type" :before-change="proceedToWizardStepSettings">
                    <div v-if="!userPublicKey" class="alert alert-info m-b-20">
                        Es muss ein PublicKey in den <nuxt-link :to="'/settings/security'"><i class="fa fa-cog"></i> Einstellungen</nuxt-link> hochgeladen werden.
                    </div>

                    <b-card no-body class="m-b-20">
                        <b-tabs pills card vertical>
                            <b-tab title="Discovery" :active="isDiscoveryTrain" :disabled="!canCreateDiscoveryTrain" @click="setIsDiscoveryTrain">
                                <b-card-text>
                                    Starte einen Discovery Zug, um zu erfahren wie viele Daten augrund der angefoderten Parameter in den Krankenhäuser verfügbar sind.
                                </b-card-text>
                            </b-tab>
                            <b-tab title="Analyse" :active="isAnalyseTrain" :disabled="!canCreateAnalyseTrain" @click="setIsAnalyseTrain">
                                <b-card-text>
                                    Starte einen Analyse auf Basis der zugrunde liegenden Ergebnisse des Discovery Zuges.
                                </b-card-text>
                            </b-tab>
                        </b-tabs>
                    </b-card>
                </tab-content>
                <tab-content title="Konfiuration" :before-change="proceedToWizardStepSummary">
                    <div class="form-group" :class="{ 'form-group-error': $v.formData.masterImageId.$error }">
                        <label>Master Image</label>
                        <select v-model="$v.formData.masterImageId.$model" class="form-control" :disabled="masterImage.busy" :disbaled="!isTrainEditAble">
                            <option value="">
                                --Auswählen--
                            </option>
                            <option v-for="(item,key) in masterImage.items" :key="key" :value="item.id">
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
                        <select v-model="$v.formData.stationIds.$model" class="form-control" multiple :disabled="proposalStation.busy || !isTrainEditAble">
                            <option v-for="(item,key) in proposalStation.items" :key="key" :value="item.id" :selected="item.included">
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
                        <input v-model="$v.formData.entryPointName.$model" type="text" class="form-control" placeholder="..." :disbaled="!isTrainEditAble">
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
                            <input type="file" class="custom-file-input" id="files" ref="entryPointFiles" @change="checkEntrypointFiles" multiple :disbaled="!isTrainEditAble">
                            <label class="custom-file-label" for="files">Dateien auswählen...</label>
                        </div>

                        <div v-if="formData.entryPointFiles.length === 0 && trainFiles.items.length === 0" class="alert alert-warning alert-sm m-t-10">
                            Es muss ein Entrypoint bzw Dateien hochgeladen werden.
                        </div>

                        <div class="flex flex-row flex-wrap m-t-10">
                            <button @click="dropTrainFile($event,item.id)" v-for="(item,key) in trainFiles.items" class="btn btn-dark btn-xs rounded" style="margin: 0 5px 5px 0;">
                                {{item.name}}
                            </button>
                            <button @click="dropEntryPointFile($event,key)" v-for="(item,key) in formData.entryPointFiles" class="btn btn-primary btn-xs rounded" style="margin: 0 5px 5px 0;">
                                {{item.name}} ({{item.size}} Bytes)
                            </button>
                        </div>
                    </div>
                </tab-content>
                <tab-content title="Zusammenfassung" :before-change="proceedToWizardStepHash">
                    <div>
                        <b-list-group>
                            <b-list-group-item class="flex-column align-items-start list-group-item-sm">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <div class="align-items-center">
                                        <h6
                                            class="m-b-0 font-weight-bold d-inline"
                                        >1. Allgemein <small>Übernehmen der Konifguration(en).</small></h6>
                                        <p>
                                            Die in dem vorherigen Schritt angegebenen Informationen werden gespeichert.
                                        </p>
                                    </div>
                                    <div>
                                        <div :class="{'spinner-border': formInfo.trainPushInProgress}" style="font-size: 2rem;">
                                            <i v-if="!formInfo.trainPushInProgress" class="fa fa-check text-success"></i>
                                        </div>
                                    </div>
                                </div>

                            </b-list-group-item>
                            <b-list-group-item class="flex-column align-items-start list-group-item-sm">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <div class="align-items-center">
                                        <h6
                                            class="m-b-0 font-weight-bold d-inline"
                                        >2. Upload <small>Upload der Entrypoint-Datei(en).</small></h6>
                                        <p>
                                            Die Dateien werden hochgeladen und dem Zug zugewiesen.
                                        </p>
                                    </div>
                                    <div>
                                        <div :class="{'spinner-border': formInfo.trainFilesSyncInProgress}" style="font-size: 2rem;">
                                            <i v-if="!formInfo.trainFilesSyncInProgress" class="fa fa-check text-success"></i>
                                        </div>
                                    </div>
                                </div>

                            </b-list-group-item>
                        </b-list-group>
                    </div>
                </tab-content>
                <tab-content title="Hash" :before-change="proceedToWizardStepFinish">
                    <div v-if="train">
                        <b-list-group>
                            <b-list-group-item class="flex-column align-items-start list-group-item-sm">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <div class="align-items-center">
                                        <h6
                                            class="m-b-0 font-weight-bold d-inline"
                                        >3. Hash <small>Generierung und Signierung des Hashes</small></h6>
                                        <p>
                                            Ein Hash wird mithilfe ihres PublicKeys über die Konfiguration des Zuges generiert.<br />
                                            Allerdings kann dieser Vorgang kann einen Moment dauern...
                                        </p>
                                    </div>
                                    <div>
                                        <div :class="{'spinner-border': trainAction.busy}" style="font-size: 2rem;">
                                            <i v-if="!trainAction.busy" class="fa fa-check text-success"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Hash</label>
                                    <input type="text" class="form-control" :value="train.hash" :disabled="true" />
                                </div>
                            </b-list-group-item>
                            <b-list-group-item class="flex-column align-items-start list-group-item-sm">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <div class="align-items-center">
                                        <h6
                                            class="m-b-0 font-weight-bold d-inline"
                                        >4. Hash-Signierung</h6>
                                    </div>
                                    <div>
                                        <div :class="{'spinner-border': formInfo.signedHashInProgress && !formInfo.signedHashSaved}" style="font-size: 2rem;">
                                            <i v-if="!busy" :class="{'fa-check text-success': formInfo.signedHashSaved, 'fa-times text-danger': !formInfo.signedHashSaved}" class="fa "></i>
                                        </div>
                                    </div>
                                </div>

                                <div class="alert alert-info alert-sm m-t-10 m-b-10">
                                    Bitte signieren Sie den oben abgebildeten generierten <b>Hash</b>
                                    und signieren Sie den Hash mit dem OfflineTool und tragen Sie
                                    den resultierenden signierten Hash im nachfolgenden Feld ein.
                                </div>

                                <alert-message :message="formInfo.signedHashMessage"></alert-message>

                                <div class="form-group">
                                    <label>Signierter Hash</label>
                                    <input type="text" class="form-control" v-model="formData.signedHash" placeholder="Signierter Hash..." />
                                </div>
                                <div>
                                    <button @click="saveSignedHash" type="button" class="btn btn-xs btn-primary">
                                        <i class="fa fa-save"></i> Speichern
                                    </button>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
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
