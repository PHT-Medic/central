<script>
import {LayoutNavigationDefaultId} from "@/config/layout.ts";
import {runTrainBuilderTaskApi, dropTrain, getTrains} from "@/domains/train/api.ts";
import {TrainStates, TrainConfiguratorStates, TrainResultStates} from "@/domains/train/index.ts";
import TrainStatusButton from "@/components/train/button/TrainStatusButton";
import TrainConfiguratorStatusButton from "@/components/train/button/TrainConfiguratorStatusButton";

export default {
    components: {TrainConfiguratorStatusButton, TrainStatusButton},
    props: {
        proposalId: {
            type: Number,
            default: undefined
        }
    },
    data () {
        return {
            busy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'type', label: 'Type', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'configurator_status', label: 'Configurator Status', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'status', label: 'Status', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'result', label: 'Result', thClass: 'text-center', tdClass: 'text-center'},
                { key: 'actions', label: 'Actions', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'options', label: 'Options', tdClass: 'text-left' }
            ],
            items: [],

            actionBusy: false,

            trainStates: TrainStates,
            trainConfiguratorStates: TrainConfiguratorStates,
            trainResultStates: TrainResultStates
        }
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            try {
                let record = {};

                if (typeof this.proposalId !== 'undefined') {
                    record.filter = {
                        proposalId: this.proposalId
                    }
                }
                this.items = await getTrains(record);
            } catch (e) {

            }
        },
        async drop(train) {
            if (this.actionBusy) return;

            this.actionBusy = true;

            try {
                await dropTrain(train.id);

                let index = this.items.findIndex(item => item.id === train.id);
                if (index !== -1) {
                    this.items.splice(index, 1);
                }
            } catch (e) {
                console.log(e);
            }

            this.actionBusy = false;
        },
        async doAction(train) {
            if (this.actionBusy) return;

            this.actionBusy = true;

            switch (train.status) {
                case this.trainConfiguratorStates.TrainConfiguratorStateHashSigned:
                    try {
                        await runTrainBuilderTaskApi(train.id, action);

                        let index = this.items.findIndex(item => item.id === train.id);
                        if (index > -1) {
                            switch (action) {
                                case 'start':
                                    this.items[index].status = this.trainStates.TrainStateStarting;

                                    //this.fakeTrainCompleted(index);
                                    break;
                                case 'stop':
                                    this.items[index].status = this.trainStates.TrainStateStopped;
                                    break;
                            }
                        }
                    } catch (e) {
                        switch (action) {
                            case 'start':
                                this.$bvToast.toast('The train could not be started...');
                                break;
                            case 'stop':
                                this.$bvToast.toast('The train could not be stopped.');
                                break;
                        }
                    }
                    break;
            }


            this.actionBusy = false;
        },
        downloadResult() {
            window.open(this.$config.authApiUrl+'pht/trains/'+item.id+'/download')
        },

        handleCreatedTrain(train) {
            const index = this.items.findIndex(item => item.id === train.id);
            if(index === -1) {
                this.items.unshift(train);
            }
        }
    },
    computed: {
        canEdit() {
            return this.$auth.can('edit','train');
        },
        canDrop() {
            return this.$auth.can('drop','train');
        },
        startTrainExecution() {
            return this.$auth.can('start','trainExecution');
        },
        stopTrainExecution() {
            return this.$auth.can('stop','trainExecution');
        }
    }
}
</script>
<template>
    <div class="container">
        <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" sort-by="id" :sort-desc="true" outlined>
            <template v-slot:cell(configurator_status)="data">
                <train-configurator-status-button :status="data.item.configuratorStatus" />
            </template>
            <template v-slot:cell(status)="data">
                <train-status-button :status="data.item.status" />
            </template>

            <template v-slot:cell(result)="data">
                <template v-if="data.item.result">
                    <button v-if="data.item.result.status === trainResultStates.TrainResultStateOpen" :disabled="true" class="btn btn-dark btn-xs" type="button">
                        1. outstanding...
                    </button>
                    <button v-else-if="data.item.result.status === trainResultStates.TrainResultStateDownloading" :disabled="true" class="btn btn-info btn-xs" type="button">
                        2. train image downloading...
                    </button>
                    <button v-else-if="data.item.result.status === trainResultStates.TrainResultStateDownloaded" :disabled="true" class="btn btn-primary btn-xs" type="button">
                        3. train image downloaded.
                    </button>
                    <button v-else-if="data.item.result.status === trainResultStates.TrainResultStateExtracting" :disabled="true" class="btn btn-info btn-xs" type="button">
                        4. extracting train image files...
                    </button>
                    <button @click="downloadResult(data.item)" v-else-if="data.item.result.status === trainResultStates.TrainResultStateFinished" :disabled="!$auth.can('read','trainResult')" class="btn btn-success btn-xs" type="button">
                        5. download
                    </button>
                    <button v-else :disabled="true" class="btn btn-danger btn-xs" type="button">
                        ?. failed
                    </button>
                </template>
                <template v-else>
                    <button :disabled="true" class="btn btn-secondary btn-xs" type="button">
                        none
                    </button>
                </template>
            </template>

            <template v-slot:cell(actions)="data">
                <button
                    v-if="data.item.status === trainConfiguratorStates.TrainConfiguratorStateHashSigned && startTrainExecution"
                    class="btn btn-outline-success btn-xs"
                    type="button"
                    @click.prevent="doAction(data.item, 'start')"
                >
                    <i class="fas fa-play" />
                </button>
                <button
                    v-if="data.item.status === trainConfiguratorStates.TrainConfiguratorStateHashSigned && stopTrainExecution"
                    class="btn btn-outline-danger btn-xs"
                    type="button"
                    :disabled="true"
                >
                    <i class="fas fa-pause" />
                </button>
            </template>

            <template v-slot:cell(options)="data">
                <div v-if="[trainStates.TrainStateStarting, trainStates.TrainStateFinished, trainStates.TrainStateStopped].indexOf(data.item.status) === -1">
                    <nuxt-link class="btn btn-dark btn-xs" type="button" v-if="canEdit" :to="'/trains/'+data.item.id+'/wizard'">
                        <i class="fas fa-hat-wizard" /> Wizard
                    </nuxt-link>
                    <button class="btn btn-danger btn-xs" type="button" v-if="canDrop" @click.prevent="drop(data.item)">
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
        <div v-if="!busy && items.length === 0" class="alert alert-sm alert-warning">
            Es sind keine Züge vorhanden...
        </div>
    </div>
</template>
