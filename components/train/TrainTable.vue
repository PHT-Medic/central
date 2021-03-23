<script>
import {dropTrain, getTrains} from "@/domains/train/api.ts";
import {TrainStates, TrainConfiguratorStates, TrainResultStates} from "@/domains/train/index.ts";
import TrainStatusButton from "@/components/train/button/TrainStatusButton";
import TrainConfiguratorStatusButton from "@/components/train/button/TrainConfiguratorStatusButton";
import AlertMessage from "@/components/alert/AlertMessage";
import Pagination from "@/components/Pagination";
import TrainBuildCommandButton from "@/components/train/button/TrainBuildCommandButton";
import TrainStartCommandButton from "@/components/train/button/TrainStartCommandButton";
import TrainStopCommandButton from "@/components/train/button/TrainStopCommandButton";

export default {
    components: {
        TrainStopCommandButton,
        TrainStartCommandButton,
        TrainBuildCommandButton,
        Pagination,
        AlertMessage,
        TrainConfiguratorStatusButton,
        TrainStatusButton
    },
    props: {
        proposalId: {
            type: Number,
            default: undefined
        }
    },
    data () {
        return {
            busy: false,
            message: null,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'updatedAt', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'createdAt', label: 'Created At', thClass: 'text-left', tdClass: 'text-left' },
                //{ key: 'configurator_status', label: 'Configuration', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'result', label: 'Result', thClass: 'text-left', tdClass: 'text-left'},
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },

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
                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    }
                };

                if (typeof this.proposalId !== 'undefined') {
                    record.filter = {
                        proposalId: this.proposalId
                    }
                }

                const response = await getTrains(record);

                this.items = response.data;
                const {total} = response.meta;

                this.meta.total = total;
            } catch (e) {

            }
        },
        goTo(options, resolve, reject) {
            if(options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
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

        stop(id) {

        },
        start(id) {

        },

        downloadResult(item) {
            window.open(this.$config.resultServiceApiUrl+'train-results/'+item.result.id+'/download')
        },

        handleTrainCreated(train) {
            const index = this.items.findIndex(item => item.id === train.id);
            if(index === -1) {
                this.items.unshift(train);
            }
        },
        handleTrainStarted(train) {
            this.message = {
                isError: false,
                data: 'Train successfully started...'
            };
            const index = this.items.findIndex(item => item.id === train.id);
            if(index !== -1) {
                this.items[index].status = train.status;
            }
        },
        handleTrainStopped(train) {
            this.message = {
                isError: false,
                data: 'Train successfully stopped...'
            };

            const index = this.items.findIndex(item => item.id === train.id);
            if(index !== -1) {
                this.items[index].status = train.status;
            }
        },
        handleTrainBuilt(train) {
            const index = this.items.findIndex(item => item.id === train.id);
            if(index !== -1) {
                this.items[index].status = train.status;
            }
        },
        handleTrainStopFailed(e) {
            this.message = {
                isError: true,
                data: e.message
            };
        }
    },
    computed: {
        canEdit() {
            return this.$auth.can('edit','train');
        },
        canDrop() {
            return this.$auth.can('drop','train');
        },
        canStartTrainExecution() {
            return this.$auth.can('start','trainExecution');
        },
        canStopTrainExecution() {
            return this.$auth.can('stop','trainExecution');
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />
        <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" sort-by="id" :sort-desc="true" outlined>
            <template v-slot:cell(id)="data">
                <nuxt-link :to="trainConfiguratorStates.TrainConfiguratorStateFinished === data.item.configuratorStatus ? '/trains/'+data.item.id+'/wizard' : '/trains/'+data.item.id+'/wizard'">
                    <i v-if="trainConfiguratorStates.TrainConfiguratorStateFinished !== data.item.configuratorStatus" class="fa fa-cog text-warning mr-2" v-b-tooltip title="Configuration open"></i> {{data.item.id}}
                </nuxt-link>
            </template>
            <template v-slot:cell(createdAt)="data">
                <timeago :datetime="data.item.createdAt" />
            </template>
            <template v-slot:cell(updatedAt)="data">
                <timeago :datetime="data.item.updatedAt" />
            </template>

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
                        <i class="fas fa-file-times"></i>
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

            <template v-slot:cell(options)="data">
                <train-start-command-button v-if="canStartTrainExecution" :train="data.item" @started="handleTrainStarted"/>
                <train-stop-command-button v-if="canStopTrainExecution" :train="data.item" @stopped="handleTrainStopped" @stopFailed="handleTrainStopFailed" />
                <train-build-command-button v-if="canEdit" :train="data.item" @built="handleTrainBuilt" />

                <template v-if="[trainStates.TrainStateStarting, trainStates.TrainStateFinished, trainStates.TrainStateStopped].indexOf(data.item.status) === -1">
                    <b-dropdown class="dropdown-xs" :no-caret="true">
                        <template #button-content>
                            <i class="fa fa-bars"></i>
                        </template>
                        <b-dropdown-item><i class="fa fa-file-download text-primary pl-1 pr-1"></i> Result</b-dropdown-item>
                        <b-dropdown-item v-if="canEdit" :to="'/trains/'+data.item.id+'/wizard'"><i class="fas fa-hat-wizard" /> Wizard</b-dropdown-item>
                        <b-dropdown-divider />
                        <b-dropdown-item v-if="canDrop" @click.prevent="drop(data.item)"><i class="fas fa-trash-alt text-danger" /> Drop</b-dropdown-item>
                    </b-dropdown>
                </template>
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

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
    </div>
</template>
