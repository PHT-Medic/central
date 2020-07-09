<script>
    import TrainBuilder from "../../../components/train/TrainBuilder";
    import TrainEdge, {TrainStates} from "../../../services/edge/train/trainEdge";

    export default {
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
                trainReferenced: null,
                trainBusy: false,
                trainStates: TrainStates,
                trains: {
                    items: [],
                    busy: false
                },
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'type', label: 'Type', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'actions', label: 'Aktionen', tdClass: 'text-left' },
                    { key: 'options', label: 'Optionen', tdClass: 'text-left' }
                ],
                trainModalId: 'train-modal',
                temp: null
            }
        },
        created() {
            this._getTrains();
        },
        methods: {
            async _getTrains() {
                if(this.trains.busy) return;

                this.trains.busy = true;

                try {
                    this.trains.items = await TrainEdge.getTrains(this.proposal.id);
                } catch (e) {
                    console.log(e);
                }

                this.trains.busy = false;
            },

            async _dropTrain(id) {
                if(this.trainBusy) return;

                this.trainBusy = true;

                try {
                     await TrainEdge.dropTrain(id);

                     let index = this.trains.items.findIndex((item) => item.id === id);
                     if(index > -1) {
                         this.trains.items.splice(index,1);
                     }
                } catch (e) {

                }

                this.trainBusy = false;
            },
            async _doTrainAction(id, action) {
                if(this.trainBusy) return;

                this.trainBusy = true;

                try {
                    await TrainEdge.doTrainAction(id, action);

                } catch (e) {
                    this.trainBusy = false;

                    throw new Error(e.message);
                }

                this.trainBusy = false;
            },

            //------------------------------------

            async doTrainAction(event, action, id) {
                event.preventDefault();

                let index = this.trains.items.findIndex((item) => item.id === id);
                if(index > -1) {
                    switch(this.trains.items[index].status) {
                        case this.trainStates.TrainStateCreated:
                        case this.trainStates.TrainStateHashGenerated:
                        case this.trainStates.TrainStateHashSigned:

                            try {
                                await this._doTrainAction(action, id);

                                switch (action) {
                                    case 'start':
                                        this.trains.items[index].status = this.trainStates.TrainStateRunning;
                                        break;
                                    case 'stop':
                                        this.trains.items[index].status = this.trainStates.TrainStateStopped;
                                        break;
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
                }
            },
            async addTrain(event) {
                event.preventDefault();

                this.trainReferenced = null;

                this.$bvModal.show(this.trainModalId);
            },
            async dropTrain(event, id) {
                event.preventDefault();

                await this._dropTrain(id);
            },
            async editTrain(event, id) {
                event.preventDefault();

                let index = this.trains.items.findIndex((item) => item.id === id);
                if(index > -1) {
                    switch(this.trains.items[index].status) {
                        case this.trainStates.TrainStateCreated:
                        case this.trainStates.TrainStateHashGenerated:
                        case this.trainStates.TrainStateHashSigned:
                            this.trainReferenced = this.trains.items[index];
                            this.$bvModal.show(this.trainModalId);
                            break;
                    }
                } else {
                    return this.addTrain(event);
                }
            },
            resetModal() {
                // todo: this.train ....
            },

            //------------------------------------

            handleModalOk(event) {
                event.preventDefault();

                this.handleModalSubmit();
            },
            handleModalSubmit() {
                this.$nextTick(() => {
                    this.$bvModal.hide(this.trainModalId);
                })
            },

            //------------------------------------

            editTrainEvent(event) {
                if(!event) return;

                let index = this.trains.items.findIndex((item) => item.id === event.id);
                if(index > - 1) {
                    for(let key in event.data) {
                        if(!event.data.hasOwnProperty(key)) continue;

                        this.trains.items[index][key] = event.data[key];
                    }
                }
            },
            addTrainEvent(event) {
                if(!event) return;

                this.trains.items.push(event);
            },
            closeBuilderEvent(event) {
                console.log('close builder');
                this.handleModalSubmit();
            }
        }
    }
</script>
<template>
    <div>
        <b-modal
            :id="trainModalId"
            @ok="handleModalOk"
            @hidden="resetModal"
            @show="resetModal"
            size="lg"
            button-size="xs"
            :title="trainReferenced ? 'Zug bearbeiten' : 'Zug erstellen'"
            hide-footer
            >
            <train-builder
                v-on:edit-train="editTrainEvent"
                v-on:add-train="addTrainEvent"
                v-on:close-builder="closeBuilderEvent"
                :proposal="proposal"
                :proposal-stations="proposalStations"
                :train-reference="trainReferenced"
            />
        </b-modal>
        <div class="panel-card">
            <div class="panel-card-header">
                <h6 class="title">
                    Züge
                </h6>
            </div>
            <div class="panel-card-body">
                <button type="button" @click="addTrain" class="btn btn-primary m-b-10">
                    <i class="fa fa-train"></i> Zug Hinzufügen
                </button>

                <div class="alert alert-primary">
                    Dies ist eine Übersicht aller bisher erstellten Züge.
                </div>

                <div class="m-t-10">
                    <b-table :items="trains.items" :fields="fields" :busy="trains.busy" head-variant="'dark'" sort-by="id" :sort-desc="true" outlined>
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

                        <template v-slot:cell(actions)="data">
                            <button
                                v-if="data.item.status === trainStates.TrainStateHashSigned"
                                class="btn btn-outline-success btn-xs"
                                type="button"
                                @click="doTrainAction($event, 'start', data.item.id)"
                            >
                                <i class="fas fa-play" />
                            </button>
                            <button
                                v-if="data.item.status === trainStates.TrainStateRunning"
                                class="btn btn-outline-danger btn-xs"
                                type="button"
                                :disabled="true"
                            >
                                <i class="fas fa-pause" />
                            </button>
                        </template>

                        <template v-slot:cell(options)="data">
                            <button class="btn btn-outline-primary btn-xs" type="button" @click="editTrain($event, data.item.id)">
                                <i class="fas fa-cog" />
                            </button>
                            <button class="btn btn-outline-danger btn-xs" type="button" @click="dropTrain($event, data.item.id)">
                                <i class="fas fa-trash-alt" />
                            </button>
                        </template>

                        <template v-slot:table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </b-table>
                </div>
            </div>
        </div>
    </div>
</template>
