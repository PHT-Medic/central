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
import TrainResultManagement from "@/components/train/result/TrainResultManagement";

export default {
    components: {
        TrainResultManagement,
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
        },
        trainAddTo: {
            type: String,
            default: '/trains/add'
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
                { key: 'user', label: 'User', thClass: 'text-center', tdClass: 'text-center'},
                { key: 'result', label: 'Result', thClass: 'text-center', tdClass: 'text-center'},
                { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },

            actionBusy: false,

            train: undefined,
            trainStates: TrainStates,
            trainConfiguratorStates: TrainConfiguratorStates,
            trainResultStates: TrainResultStates,
            trainResultStateTitles: {}
        }
    },
    created() {
        this.trainResultStateTitles[TrainResultStates.TrainResultStateOpen] = 'Outstanding';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateDownloading] = 'Downloading...';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateDownloaded] = 'Downloaded...';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateExtracting] = 'Extracting...';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateExtracted] = 'Extracted';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateFinished] = 'Finished';
        this.trainResultStateTitles[TrainResultStates.TrainResultStateFailed] = 'Failed';
        this.load();
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    include: [
                        'result',
                        //'stations',
                        'user'
                    ]
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

            this.busy = false;
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

        manageTrainResult(train) {
            this.train = train;

            this.$refs['result'].show();
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
        handleTrainBuilding(train) {
            const index = this.items.findIndex(item => item.id === train.id);
            if(index !== -1) {
                this.items[index].status = TrainStates.TrainStateBuilding;

                setTimeout(() => {
                    this.items[index].status = train.status;
                    this.items[index].result = train.result;
                }, 3000);
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
        <div class="d-flex flex-row mb-2">
            <div>
                <button class="btn btn-primary btn-xs" @click.prevent="load" :disabled="busy">
                    <i class="fa fa-sync"></i> refresh
                </button>
            </div>
            <div style="margin-left: auto;">
                <nuxt-link :to="trainAddTo" class="btn btn-primary btn-xs">
                    <i class="fa fa-plus"></i> add
                </nuxt-link>
            </div>
        </div>

        <alert-message :message="message" />

        <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" outlined>
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

            <template v-slot:cell(user)="data">
                {{data.item.user.name}}
            </template>

            <template v-slot:cell(result)="data">
                <button
                    class="btn btn-xs bg-transparent btn-outline-dark"
                    :disabled="!$auth.can('read','trainResult')" @click.prevent="manageTrainResult(data.item)"
                    :title="data.item.result ? trainResultStateTitles[data.item.result.status] : 'None'"
                    v-b-tooltip
                    >
                    <template v-if="data.item.result">
                        <span v-if="data.item.result.status === trainResultStates.TrainResultStateOpen" :disabled="true" class="text-dark">
                            <i class="far fa-lightbulb"></i>
                        </span>
                        <span v-else-if="data.item.result.status === trainResultStates.TrainResultStateDownloading" :disabled="true" class="text-info">
                            <i class="fa fa-download"></i>
                        </span>
                        <span v-else-if="data.item.result.status === trainResultStates.TrainResultStateDownloaded" :disabled="true" class="text-primary">
                            <i class="fa fa-file-download"></i>
                        </span>
                        <span v-else-if="data.item.result.status === trainResultStates.TrainResultStateExtracting" :disabled="true" class="text-info">
                            <i class="fa fa-file-export"></i>
                        </span>
                        <span v-else-if="data.item.result.status === trainResultStates.TrainResultStateExtracted" :disabled="true" class="text-success">
                            <i class="fa fa-file-export"></i>
                        </span>
                        <span v-else-if="data.item.result.status === trainResultStates.TrainResultStateFinished" class="text-success">
                            <i class="fa fa-save"></i>
                        </span>
                        <span v-else class="text-danger">
                            <i class="fa fa-exclamation"></i>
                        </span>
                    </template>
                    <template v-else>
                        <span class="text-secondary">
                            <i class="fa fa-question"></i>
                        </span>
                    </template>
                </button>
            </template>

            <template v-slot:cell(options)="data">
                <train-start-command-button v-if="canStartTrainExecution" :train="data.item" @started="handleTrainStarted" v-b-tooltip title="Start"/>
                <train-stop-command-button v-if="canStopTrainExecution" :train="data.item" @stopped="handleTrainStopped" @stopFailed="handleTrainStopFailed" v-b-tooltip title="Stop" />
                <train-build-command-button v-if="canEdit && data.item.status !== trainStates.TrainStateBuilding && data.item.status !== trainStates.TrainStateBuilt" :train="data.item" @built="handleTrainBuilding" v-b-tooltip title="Build" />

                <template v-if="[trainStates.TrainStateStarting, trainStates.TrainStateBuilding, trainStates.TrainStateStopping].indexOf(data.item.status) === -1">
                    <b-dropdown class="dropdown-xs" :no-caret="true">
                        <template #button-content>
                            <i class="fa fa-bars"></i>
                        </template>
                        <b-dropdown-item @click.prevent="manageTrainResult(data.item)"><i class="fa fa-file text-primary pl-1 pr-1"></i> Result</b-dropdown-item>
                        <b-dropdown-item v-if="canEdit" :to="'/trains/'+data.item.id+'/wizard'"><i class="fas fa-cog" /> Configuration</b-dropdown-item>
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

        <b-modal
            size="lg"
            ref="result"
            button-size="sm"
            title-html="<i class='fas fa-file'></i> Train Result"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <train-result-management :train-property="train" />
        </b-modal>
    </div>
</template>
