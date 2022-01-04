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
import Vue from 'vue';
import AlertMessage from '../../alert/AlertMessage';
import Pagination from '../../Pagination';
import TrainListItem from './TrainListItem';

export default {
    components: {
        TrainListItem,
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
                (
                    this.queryFinal.sort.created_at === 'DESC' ||
                    this.queryFinal.sort.updated_at === 'DESC'
                ) &&
                this.meta.offset === 0
            ) {
                this.handleCreated(context.data, true);
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
        handleCreated(item, atStart = false) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index === -1) {
                if (atStart) {
                    this.items.splice(0, 0, item);
                } else {
                    this.items.push(item);
                }

                if (this.items.length > this.meta.limit) {
                    this.items.splice(this.meta.limit, 1);
                }

                this.meta.total++;

                this.$emit('created', item);
            }
        },
        handleUpdated(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                const keys = Object.keys(item);
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }

            this.$emit('updated', item);
        },
        handleDeleted(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', item);
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
                <train-list-item
                    :key="item.id"
                    class="mb-2 d-block"
                    :entity-property="item"
                    @updated="handleUpdated"
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
