<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID, dropProposal, getProposals } from '@personalhealthtrain/ui-common';
import Pagination from '../../../components/Pagination';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';

export default {
    components: { Pagination },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
            PermissionID.PROPOSAL_DROP,
            PermissionID.PROPOSAL_EDIT,

            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_DROP,

            PermissionID.TRAIN_RESULT_READ,

            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
        ],
    },
    data() {
        return {
            isBusy: false,
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'title', label: 'Title', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
        };
    },
    computed: {
        canView() {
            return this.$auth.hasPermission(PermissionID.TRAIN_ADD) ||
                    this.$auth.hasPermission(PermissionID.TRAIN_EDIT) ||
                    this.$auth.hasPermission(PermissionID.TRAIN_DROP) ||
                    this.$auth.hasPermission(PermissionID.TRAIN_RESULT_READ) ||
                    this.$auth.hasPermission(PermissionID.TRAIN_EXECUTION_START) ||
                    this.$auth.hasPermission(PermissionID.TRAIN_EXECUTION_STOP);
        },
        canEdit() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT);
        },
        canDrop() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_DROP);
        },
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            if (this.isBusy) return;

            this.isBusy = true;

            try {
                const record = {
                    filter: {
                        realm_id: this.$store.getters['auth/userRealmId'],
                    },
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                };

                const response = await getProposals(record);

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.isBusy = false;
        },
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },
        async dropProposal(id) {
            const index = this.items.findIndex((item) => item.id === id);
            if (index === -1) {
                return;
            }

            try {
                await dropProposal(this.items[index].id);
                this.items.splice(index, 1);
            } catch (e) {
                // ...
            }
        },
    },
};
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all proposals, which are created by you or one of your co workers.
        </div>
        <div class="m-t-10">
            <b-table
                :items="items"
                :fields="fields"
                :busy="isBusy"
                head-variant="'dark'"
                outlined
            >
                <template #cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template #cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>

                <template #cell(options)="data">
                    <nuxt-link
                        v-if="canEdit"
                        :to="'/proposals/' + data.item.id "
                        title="View"
                        class="btn btn-outline-primary btn-xs"
                    >
                        <i class="fa fa-arrow-right" />
                    </nuxt-link>
                    <nuxt-link
                        v-if="canView"
                        :to="'/proposals/' + data.item.id + '/trains'"
                        title="Zug Verwaltung"
                        class="btn btn-outline-dark btn-xs"
                    >
                        <i class="fa fa-train" />
                    </nuxt-link>
                    <a
                        v-if="canDrop"
                        class="btn btn-outline-danger btn-xs"
                        title="Delete"
                        @click="dropProposal(data.item.id)"
                    >
                        <i class="fas fa-trash-alt" />
                    </a>
                </template>

                <template #table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
            <div
                v-if="!isBusy && items.length === 0"
                class="alert alert-warning alert-sm"
            >
                There are no proposals available.
            </div>

            <pagination
                :total="meta.total"
                :offset="meta.offset"
                :limit="meta.limit"
                @to="goTo"
            />
        </div>
    </div>
</template>
