<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID, buildSocketProposalRoomName, getProposals, mergeDeep,
} from '@personalhealthtrain/ui-common';
import Vue from 'vue';
import Pagination from '../../Pagination';
import ProposalListItem from './ProposalListItem';

export default {
    components: { ProposalListItem, Pagination },
    props: {
        filterItems: Function,
        query: {
            type: Object,
            default() {
                return {};
            },
        },
        withTitle: {
            type: Boolean,
            default: true,
        },
        withSearch: {
            type: Boolean,
            default: true,
        },
        loadOnInit: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            busy: false,
            items: [],
            q: '',
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            itemBusy: false,
        };
    },
    computed: {
        itemsFinal() {
            if (typeof this.filterItems === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filterItems);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_DROP);
        },
    },
    watch: {
        q(val, oldVal) {
            if (val === oldVal) return;

            if (val.length === 1 && val.length > oldVal.length) {
                return;
            }

            this.meta.offset = 0;

            this.load();
        },
    },
    created() {
        if (this.loadOnInit) {
            this.load();
        }
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.query?.filter?.realm_id ?? this.query?.filters?.realm_id);
        socket.emit('proposalsSubscribe');

        socket.on('proposalCreated', this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.query?.filter?.realm_id ?? this.query?.filters?.realm_id);
        socket.emit('proposalsUnsubscribe');

        socket.off('proposalCreated', this.handleSocketCreated);
    },
    methods: {
        handleSocketCreated(context) {
            if (context.meta.roomName !== buildSocketProposalRoomName()) return;

            if (
                (this.query.sort.created_at === 'DESC' || this.query.sort.updated_at === 'DESC') &&
                this.meta.offset === 0
            ) {
                this.handleCreated(context.data, true);
            }

            this.$emit('created', context.data);
        },
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getProposals(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        title: this.q.length > 0 ? `~${this.q}` : this.q,
                    },
                }, this.query));

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
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
    },
};
</script>
<template>
    <div>
        <slot name="header">
            <div class="d-flex flex-row mb-2">
                <div v-if="withTitle">
                    <slot name="header-title">
                        <h6 class="mb-0">
                            📜 Proposals
                        </h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot
                        name="header-actions"
                        :load="load"
                        :busy="busy"
                    >
                        <div class="d-flex flex-row">
                            <div>
                                <button
                                    type="button"
                                    class="btn btn-xs btn-dark"
                                    :disabled="busy"
                                    @click.prevent="load"
                                >
                                    <i class="fas fa-sync" /> Refresh
                                </button>
                            </div>
                            <div class="ml-2">
                                <nuxt-link
                                    to="/proposals/add"
                                    type="button"
                                    class="btn btn-xs btn-success"
                                >
                                    <i class="fa fa-plus" /> Add
                                </nuxt-link>
                            </div>
                        </div>
                    </slot>
                </div>
            </div>
        </slot>
        <div class="form-group">
            <div class="input-group">
                <label />
                <input
                    v-model="q"
                    type="text"
                    name="q"
                    class="form-control"
                    placeholder="..."
                >
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fa fa-search" /></span>
                </div>
            </div>
        </div>
        <slot
            name="items"
            :items="itemsFinal"
            :busy="busy"
            :item-busy="itemBusy"
            :handle-updated="handleUpdated"
            :handle-deleted="handleDeleted"
        >
            <div class="c-list">
                <template
                    v-for="item in itemsFinal"
                >
                    <slot
                        name="item"
                        :item="item"
                        :busy="itemBusy"
                        :handle-updated="handleUpdated"
                        :handle-deleted="handleDeleted"
                    >
                        <proposal-list-item
                            :key="item.id"
                            class="mb-2"
                            :entity-property="item"
                            @updated="handleUpdated"
                            @deleted="handleDeleted"
                        />
                    </slot>
                </template>
            </div>
        </slot>

        <div
            v-if="!busy && itemsFinal.length === 0"
            slot="no-more"
        >
            <div class="alert alert-sm alert-info">
                No proposals available...
            </div>
        </div>

        <pagination
            :total="meta.total"
            :offset="meta.offset"
            :limit="meta.limit"
            @to="goTo"
        />
    </div>
</template>
