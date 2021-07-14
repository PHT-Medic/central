<script>
import {LayoutNavigationAdminId} from "@/config/layout";
import ProviderForm from "@/components/admin/provider/ProviderForm";
import {dropProvider, getProviders} from "@/domains/provider/api.ts";
import Pagination from "@/components/Pagination";

export default {
    props: {
        realm: Object
    },
    components: {Pagination, ProviderForm},
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility(can) {
            return can('add','provider') || can('edit','provider') || can('drop','provider');
        }
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'openId', label: 'OpenID?', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'createdAt', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updatedAt', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
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
        handleCreated(e) {
            this.$refs['form'].hide();

            this.items.push(e);
        },
        handleUpdated(e) {
            this.$refs['form'].hide();

            const index = this.items.findIndex(item => item.id === e.id);

            Object.assign(this.items[index], e);
        },
        async load() {
            this.isBusy = true;

            try {
                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        realmId: this.realm.id
                    },
                    fields: {
                        provider: ['clientSecret']
                    }
                };

                const response = await getProviders(record);
                this.items = response.data;
                const {total} = response.meta;

                this.meta.total = total;
            } catch (e) {
            }

            this.isBusy = false;
        },
        async add() {
            this.mode = 'add';
            this.item = undefined;

            this.$refs['form'].show();
        },
        async edit(id) {
            this.mode = 'edit';
            this.item = this.items.filter((item) => item.id === id)[0];

            this.$refs['form'].show();
        },
        async drop(user) {
            let l = this.$createElement;

            try {
                let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-warning m-b-0'}, [
                    l('p', null, [
                        'Are you sure you want to delete the OAuth provider: ',
                        l('b', null, [user.name]),
                        ' ?'
                    ])
                ]), {
                    size: 'sm',
                    buttonSize: 'xs'
                });

                if(proceed) {
                    try {
                        let index = this.items.findIndex((el) => {
                            return el.id === user.id
                        });

                        if(index !== -1) {
                            await dropProvider(user.id);

                            this.items.splice(index,1);
                        }
                    } catch (e) {

                    }
                }
            } catch (e) {

            }
        }
    }
}
</script>
<template>
    <div class="container">
        <div class="d-flex flex-row">
            <div>
                <button @click.prevent="load" type="button" class="btn btn-xs btn-dark">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
            <div style="margin-left: auto;">
                <button @click.prevent="add" type="button" class="btn btn-xs btn-success">
                    <i class="fa fa-plus"></i> Add
                </button>
            </div>
        </div>
        <div class="m-t-10">
            <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                <template v-slot:cell(realm)="data">
                    <span class="badge-dark badge">{{data.item.realm.name}}</span>
                </template>
                <template v-slot:cell(options)="data">
                    <button
                        v-if="$auth.can('edit','provider')"
                        @click.prevent="edit(data.item.id)"
                        class="btn btn-xs btn-outline-primary"
                    >
                        <i class="fa fa-bars"></i>
                    </button>
                    <button
                        v-if="$auth.can('drop','provider')"
                        @click.prevent="drop(data.item)"
                        type="button"
                        class="btn btn-xs btn-outline-danger"
                        title="Löschen"
                    >
                        <i class="fa fa-times"></i>
                    </button>
                </template>
                <template v-slot:cell(createdAt)="data">
                    <timeago :datetime="data.item.createdAt" />
                </template>
                <template v-slot:cell(updatedAt)="data">
                    <timeago :datetime="data.item.updatedAt" />
                </template>
                <template v-slot:cell(openId)="data">
                    <i class="fa" :class="{'fa-check text-success': data.item.openId, 'fa-times text-danger': !data.item.openId}" />
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
            <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
        </div>
        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            title-html="<i class='fas fa-sign-in-alt'></i> OAuth Provider"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <provider-form
                :provider="item"
                :realm-id="realm.id"
                @created="handleCreated"
                @updated="handleUpdated"
            />
        </b-modal>
    </div>
</template>
