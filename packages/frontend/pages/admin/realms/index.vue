<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropRealm, getRealms} from "@personalhealthtrain/ui-common";
import {LayoutNavigationAdminId} from "../../../config/layout";
import RealmForm from "../../../components/admin/realm/RealmForm";
import RealmList from "../../../components/realm/RealmList";

export default {
    components: {RealmList, RealmForm},
    meta: {
        navigationId: LayoutNavigationAdminId,
        requireLoggedIn: true,
        requireAbility(can) {
            return can('add','realm') || can('edit','realm') || can('drop','realm');
        }
    },
    data() {
        return {
            item: undefined,
            mode: 'add',
            isBusy: false,
            fields: [
                { key: 'name', label: 'Name', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: []
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
                this.items = await getRealms();
                this.isBusy = false;
            } catch (e) {
                this.isBusy = false;
                throw e;
            }
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
        async drop(item) {
            let l = this.$createElement;

            try {
                let proceed = await this.$bvModal.msgBoxConfirm(l('div', {class: 'alert alert-info m-b-0'}, [
                    l('p', null, [
                        'Are you sure that you want to delete  ',
                        l('b', null, [item.name]),
                        '?'
                    ])
                ]), {
                    size: 'sm',
                    buttonSize: 'xs',
                    cancelTitle: 'Abbrechen'
                });

                if(proceed) {
                    try {
                        let index = this.items.findIndex(el => el.id === item.id);

                        if(index !== -1) {
                            await dropRealm(item.id);

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
        <h1 class="title no-border mb-3">
            Realm <span class="sub-title">Management</span>
        </h1>

        <realm-list>
            <template v-slot:header-title>
                This is a slight overview of all realms.
            </template>
            <template v-slot:header-actions="props">
                <div class="d-flex flex-row">
                    <div>
                        <button type="button" class="btn btn-xs btn-dark" :disabled="props.busy" @click.prevent="props.load">
                            <i class="fas fa-sync"></i> Refresh
                        </button>
                    </div>
                    <div class="ml-2">
                        <button type="button" class="btn btn-xs btn-success"  @click.prevent="add">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </template>
            <template v-slot:items="props">
                <b-table :items="props.items" :fields="fields" :busy="props.busy" head-variant="'dark'" outlined>
                    <template v-slot:cell(options)="data">
                        <nuxt-link
                            :to="'/admin/realms/'+data.item.id"
                            v-if="$auth.can('edit','realm')"
                            @click.prevent="edit(data.item.id)"
                            class="btn btn-xs btn-outline-primary"
                        >
                            <i class="fa fa-arrow-right"></i>
                        </nuxt-link>
                        <button
                            v-if="$auth.can('drop','realm') && data.item.drop_able"
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
                    <template v-slot:table-busy>
                        <div class="text-center text-danger my-2">
                            <b-spinner class="align-middle" />
                            <strong>Loading...</strong>
                        </div>
                    </template>
                </b-table>
            </template>
        </realm-list>
        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            title-html="<i class='fas fa-university'></i> Realm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <realm-form :mode-property="mode" :realm-property="item" @created="handleCreated" @updated="handleUpdated"/>
        </b-modal>
    </div>
</template>
