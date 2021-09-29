<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {dropProposal, getProposals} from "@/domains/proposal/api.ts";
    import {LayoutNavigationDefaultId} from "@/config/layout.ts";
    import Pagination from "@/components/Pagination";

    export default {
        components: {Pagination},
        meta: {
            navigationId: LayoutNavigationDefaultId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add', 'proposal') || can('edit', 'proposal') || can('drop','proposal') ||
                    can('add', 'train') || can('drop', 'train') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        },
        data () {
            return {
                isBusy: false,
                fields: [
                    { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'title', label: 'Title', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                    { key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
                    { key: 'options', label: '', tdClass: 'text-left' }
                ],
                items: [],
                meta: {
                    limit: 10,
                    offset: 0,
                    total: 0
                },
            }
        },
        created() {
            this.load();
        },
        methods: {
            async load() {
                if(this.isBusy) return;

                this.isBusy = true;

                try {
                    const record = {
                        filter: {
                            realm_id: this.$store.getters['auth/userRealmId']
                        },
                        page: {
                            limit: this.meta.limit,
                            offset: this.meta.offset
                        }
                    };

                    const response = await getProposals(record);

                    this.items = response.data;
                    const {total} = response.meta;

                    this.meta.total = total;
                } catch (e) {

                }

                this.isBusy = false;
            },
            goTo(options, resolve, reject) {
                if(options.offset === this.meta.offset) return;

                this.meta.offset = options.offset;

                this.load()
                    .then(resolve)
                    .catch(reject);
            },
            async dropProposal (id) {
                const index = this.items.findIndex(item => item.id === id);
                if (index === -1) {
                    return;
                }

                try {
                    await dropProposal(this.items[index].id);
                    this.items.splice(index, 1);
                } catch (e) {

                }
            },

            canGoToTrainView() {
                return this.$auth.can('add','train') || this.$auth.can('edit','train') || this.$auth.can('drop','train') ||
                    this.$auth.can('read', 'trainResult') || this.$auth.can('start', 'trainExecution') || this.$auth.can('stop','trainExecution')
            },
            canEdit() {
                return this.$auth.can('edit','proposal');
            },
            canDrop() {
                return this.$auth.can('drop','proposal');
            }
        }
    }
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all proposals, which are created by you or one of your co workers.
        </div>
        <div class="m-t-10">
            <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                <template v-slot:cell(created_at)="data">
                    <timeago :datetime="data.item.createdAt" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updatedAt" />
                </template>

                <template v-slot:cell(options)="data">
                    <nuxt-link v-if="canEdit" :to="'/proposals/' + data.item.id " title="View" class="btn btn-outline-primary btn-xs">
                        <i class="fa fa-arrow-right" />
                    </nuxt-link>
                    <nuxt-link v-if="canGoToTrainView" :to="'/proposals/' + data.item.id + '/trains'" title="Zug Verwaltung" class="btn btn-outline-dark btn-xs">
                        <i class="fa fa-train" />
                    </nuxt-link>
                    <a v-if="canDrop" class="btn btn-outline-danger btn-xs" title="Delete" @click="dropProposal(data.item.id)">
                        <i class="fas fa-trash-alt" /></a>
                </template>

                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
            <div class="alert alert-warning alert-sm" v-if="!isBusy && items.length === 0">
                There are no proposals available.
            </div>

            <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
        </div>
    </div>
</template>
