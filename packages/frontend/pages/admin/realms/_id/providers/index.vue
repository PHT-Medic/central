<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropAPIProvider, getAPIProviders, PermissionID, Realm} from "@personalhealthtrain/ui-common";
import ProviderForm from "../../../../../components/domains/admin/provider/ProviderForm";
import Pagination from "../../../../../components/Pagination";
import {Layout, LayoutNavigationID} from "../../../../../modules/layout/contants";

export default {
    props: {
        realm: Realm
    },
    components: {Pagination, ProviderForm},
    meta: {
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [
            PermissionID.PROVIDER_ADD,
            PermissionID.PROPOSAL_EDIT,
            PermissionID.PROPOSAL_DROP
        ]
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
                { key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
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
                const response = await getAPIProviders({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        realm_id: this.realm.id
                    },
                    fields: ['+client_secret']
                });

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
                            await dropAPIProvider(user.id);

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
                <template v-slot:cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
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
