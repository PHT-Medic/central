<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropAPITrain, getAPITrains} from "@personalhealthtrain/ui-common/src";
import AlertMessage from "../../components/alert/AlertMessage";
import Pagination from "../../components/Pagination";
import TrainCard from "../../components/train/TrainCard";

export default {
    components: {
        TrainCard,
        Pagination,
        AlertMessage
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
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            }
        }
    },
    created() {
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

                const response = await getAPITrains(record);

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
                await dropAPITrain(train.id);

                let index = this.items.findIndex(item => item.id === train.id);
                if (index !== -1) {
                    this.items.splice(index, 1);
                }
            } catch (e) {
                console.log(e);
            }

            this.actionBusy = false;
        }
    },
    computed: {
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

        <div class="row mb-2">
            <div class="col-12 mb-2" v-for="(item, key) in items">
                <train-card :train-property="item" />
            </div>
        </div>

        <div v-if="!busy && items.length === 0" class="alert alert-sm alert-warning">
            No trains available...
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
    </div>
</template>
