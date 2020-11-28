<script>
    import TrainBuilder from "../../../components/train/TrainBuilder";
    import {TrainStates, TrainTypes} from "../../../domains/train";
    import {doTrainAction, dropTrain, getTrains} from "@/domains/train/api.ts";

    export default {
        meta: {
            requireAbility: (can) => {
                return can('add', 'train') || can('edit','train') || can('drop', 'train') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        },
        components: {TrainBuilder},
        props: {
            proposal: {
                type: Object,
                default () {
                    return {};
                }
            },
            proposalStations: {
                type: Array,
                default () {
                    return [];
                }
            }
        },
        data() {
            return {
                trainStates: TrainStates,
                train: {
                    item: undefined,
                    itemBusy: false,
                    items: [],
                    itemsBusy: false
                },
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'type', label: 'Type', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'result', label: 'Ergebnis', thClass: 'text-left', tdClass: 'text-left'},
                    { key: 'actions', label: 'Aktionen', tdClass: 'text-left' },
                    { key: 'options', label: 'Optionen', tdClass: 'text-left' }
                ],
                trainModalId: 'train-modal',
                temp: null
            }
        },
        created() {
            this.load();
        },
        methods: {
            async load() {
                if(this.train.itemsBusy) return;

                this.train.itemsBusy = true;

                try {
                    this.train.items = await getTrains({
                        filter: {
                            proposalId: this.proposal.id
                        }
                    });
                } catch (e) {
                    console.log(e);
                }

                this.train.itemsBusy = false;
            },

            async drop(train) {
                if(this.train.itemBusy) return;

                this.train.itemBusy = true;

                try {
                     await dropTrain(train.id);

                     let index = this.train.items.findIndex(item => item.id === train.id);
                     if(index > -1) {
                         this.train.items.splice(index,1);
                     }
                } catch (e) {

                }

                this.train.itemBusy = false;
            },

            //------------------------------------

            fakeCompleted(index) {
                let result = null;

                switch (this.train.items[index].type) {
                    case TrainTypes.TrainTypeDiscovery:
                        result = 'http://46.105.111.211:4000/discovery.zip';
                        break;
                    case TrainTypes.TrainTypeAnalyse:
                        result = 'http://46.105.111.211:4000/analyse.zip';
                        break;
                }

                this.train.items[index].status = this.trainStates.TrainStateFinished;
                this.train.items[index].result = result;

                this.$bvToast.toast('Der Zug konnte wurde erfolgreich ausgeführt.');
            },

            async doAction(train, action) {
                if(this.train.itemsBusy) return;

                this.train.itemBusy = true;

                switch(train.status) {
                    case this.trainStates.TrainStateCreated:
                    case this.trainStates.TrainStateHashGenerated:
                    case this.trainStates.TrainStateHashSigned:
                        try {
                            await doTrainAction(train.id, action);

                            let index = this.train.items.findIndex((item) => item.id === train.id);
                            if(index > -1) {
                                switch (action) {
                                    case 'start':
                                        this.train.items[index].status = this.trainStates.TrainStateRunning;

                                        //this.fakeTrainCompleted(index);
                                        break;
                                    case 'stop':
                                        this.train.items[index].status = this.trainStates.TrainStateStopped;
                                        break;
                                }
                            }
                        } catch (e) {
                            switch (action) {
                                case 'start':
                                    this.$bvToast.toast('Der Zug konnte nicht gestartet werden.');
                                    break;
                                case 'stop':
                                    this.$bvToast.toast('Der Zug konnte nicht gestoppt werden.');
                                    break;
                            }
                        }
                        break;
                }


                this.train.itemBusy = false;
            },
            async addTrain() {
                this.train.item = undefined;

                this.$bvModal.show(this.trainModalId);
            },
            async edit(train) {
                switch(train.status) {
                    case this.trainStates.TrainStateCreated:
                    case this.trainStates.TrainStateHashGenerated:
                    case this.trainStates.TrainStateHashSigned:
                        this.train.item = train;
                        this.$bvModal.show(this.trainModalId);
                        break;
                }
            },
            resetModal() {
                // todo: this.train ....
            },

            //------------------------------------

            handleModalSubmit() {
                this.$nextTick(() => {
                    this.$bvModal.hide(this.trainModalId);
                })
            },

            //------------------------------------

            handleUpdated(train) {
                let index = this.train.items.findIndex((item) => item.id === train.id);
                if(index > - 1) {
                    this.train.items[index] = train;
                }
            },
            handleCreated(train) {
                this.train.items.push(train);
            },
            handleClose() {
                this.handleModalSubmit();
            },

            generateUrl(item) {
                return this.$config.authApiUrl+'/public/train/'+item.id+'.tar';
            }
        },
        computed: {
            startTrainExecution() {
                return this.$auth.can('start','trainExecution');
            },
            stopTrainExecution() {
                return this.$auth.loadMe().then(() => {
                    return this.$auth.can('stop','trainExecution');
                }).catch(() => {
                    return false;
                })
            }
        }
    }
</script>
<template>
    <div>
        <b-modal
            :id="trainModalId"
            @ok="handleModalSubmit"
            @hidden="resetModal"
            @show="resetModal"
            size="lg"
            button-size="xs"
            :title-html="'<i class=\'fa fa-train\'></i> Zug ' + (train.item ? 'bearbeiten' : 'erstellen')"
            hide-footer
        >
            <train-builder
                @updated="handleUpdated"
                @created="handleCreated"
                @close-builder="handleClose"
                :proposal="proposal"
                :proposal-stations="proposalStations"
                :train-reference="train.item"
            />
        </b-modal>
        <div class="panel-card">
            <div class="panel-card-body">
                <button type="button" @click.prevent="addTrain" class="btn btn-primary m-b-10">
                    <i class="fa fa-train"></i> Zug Hinzufügen
                </button>

                <div class="alert alert-primary alert-sm">
                    Dies ist eine Übersicht aller bisher erstellten Züge.
                </div>

                <div class="m-t-10">
                    <b-table :items="train.items" :fields="fields" :busy="train.busy" head-variant="'dark'" sort-by="id" :sort-desc="true" outlined>
                        <template v-slot:cell(status)="data">
                            <button v-if="data.item.status === trainStates.TrainStateCreated" class="btn btn-dark btn-xs" type="button">
                                1. Konfiguriert
                            </button>
                            <button v-else-if="data.item.status === trainStates.TrainStateHashGenerated" class="btn btn-info btn-xs" type="button">
                                2. Hash generiert
                            </button>
                            <button v-else-if="data.item.status === trainStates.TrainStateHashSigned" class="btn btn-primary btn-xs" type="button">
                                3. Hash signiert
                            </button>
                            <button v-else-if="data.item.status === trainStates.TrainStateRunning" class="btn btn-success btn-xs" type="button">
                                4. Unterwegs
                            </button>
                            <button v-else-if="data.item.status === trainStates.TrainStateFinished" class="btn btn-warning btn-xs" type="button">
                                5. Beendet
                            </button>
                        </template>

                        <template v-slot:cell(result)="data">
                            <div v-if="!data.item.result" class="text-muted font-weight-bold">
                                Es wurde noch kein Ergebnis generiert...
                            </div>
                            <div v-if="data.item.result">
                                <a :href="generateUrl(data.item)" target="_blank" class="btn btn-primary btn-xs" v-if="$auth.can('read','trainResult')">
                                    <i class="fa fa-download"></i> Download
                                </a>
                            </div>
                        </template>

                        <template v-slot:cell(actions)="data">
                            <button
                                v-if="data.item.status === trainStates.TrainStateHashSigned && startTrainExecution"
                                class="btn btn-outline-success btn-xs"
                                type="button"
                                @click.prevent="doAction(data.item, 'start')"
                            >
                                <i class="fas fa-play" />
                            </button>
                            <button
                                v-if="data.item.status === trainStates.TrainStateRunning && stopTrainExecution"
                                class="btn btn-outline-danger btn-xs"
                                type="button"
                                :disabled="true"
                            >
                                <i class="fas fa-pause" />
                            </button>
                        </template>

                        <template v-slot:cell(options)="data">
                            <div v-if="[trainStates.TrainStateRunning, trainStates.TrainStateFinished, trainStates.TrainStateStopped].indexOf(data.item.status) === -1">
                                <button class="btn btn-outline-primary btn-xs" type="button" v-if="$auth.can('add', 'train')" @click.prevent="edit(data.item)">
                                    <i class="fas fa-cog" />
                                </button>
                                <button class="btn btn-outline-danger btn-xs" type="button" v-if="$auth.can('drop','train')" @click.prevent="drop(data.item)">
                                    <i class="fas fa-trash-alt" />
                                </button>
                            </div>
                        </template>

                        <template v-slot:table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </b-table>
                    <div v-if="!train.items.busy && train.items.length === 0" class="alert alert-sm alert-warning">
                        Es sind keine Züge vorhanden...
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
