<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    buildSocketTrainRoomName, getAPITrains, mergeDeep,
} from '@personalhealthtrain/ui-common';
import AlertMessage from '../../alert/AlertMessage';
import Pagination from '../../Pagination';
import TrainCard from './TrainCard';

export default {
    components: {
        TrainCard,
        Pagination,
        AlertMessage,
    },
    props: {
        proposalId: {
            type: Number,
            default: undefined,
        },
        trainAddTo: {
            type: String,
            default: '/trains/add',
        },
        query: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            busy: false,

            message: null,
            items: [],

            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
        };
    },
    computed: {
        queryFinal() {
            return mergeDeep({
                page: {
                    limit: this.meta.limit,
                    offset: this.meta.offset,
                },
                sort: {
                    created_at: 'DESC',
                },
                include: {
                    result: true,
                    user: true,
                },
                filter: {
                    ...(this.proposalId ? { proposal_id: this.proposalId } : {}),
                },
            }, this.query);
        },
    },
    created() {
        this.load();
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.queryFinal.filter.realm_id);
        socket.emit('trainsSubscribe');

        socket.on('trainCreated', this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.queryFinal.filter.realm_id);
        socket.emit('trainsUnsubscribe');

        socket.off('trainCreated', this.handleSocketCreated);
    },
    methods: {
        handleSocketCreated(context) {
            if (context.meta.roomName !== buildSocketTrainRoomName()) return;

            if (
                this.queryFinal.sort.created_at === 'DESC' &&
                this.meta.offset === 0
            ) {
                this.items.splice(0, 0, context.data);

                if (this.items.length > this.meta.total) {
                    this.items.splice(this.meta.length, 1);
                }

                this.meta.total++;
            }
        },
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getAPITrains(this.queryFinal);

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        handleDeleted(train) {
            const index = this.items.findIndex((item) => item.id === train.id);
            if (index !== -1) {
                this.items.splice(index, 1);
            }
        },
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },
    },
};
</script>
<template>
    <div>
        <div class="d-flex flex-row mb-2">
            <div>
                <button
                    class="btn btn-primary btn-xs"
                    :disabled="busy"
                    @click.prevent="load"
                >
                    <i class="fa fa-sync" /> refresh
                </button>
            </div>
            <div style="margin-left: auto;">
                <nuxt-link
                    :to="trainAddTo"
                    class="btn btn-primary btn-xs"
                >
                    <i class="fa fa-plus" /> add
                </nuxt-link>
            </div>
        </div>

        <alert-message :message="message" />

        <div class="d-flex flex-column">
            <template
                v-for="item in items"
            >
                <train-card
                    :key="item.id"
                    class="mb-2 d-block"
                    :train-property="item"
                    @deleted="handleDeleted"
                />
            </template>
        </div>

        <div
            v-if="!busy && items.length === 0"
            class="alert alert-sm alert-warning"
        >
            No trains available...
        </div>

        <pagination
            :total="meta.total"
            :offset="meta.offset"
            :limit="meta.limit"
            @to="goTo"
        />
    </div>
</template>
